const CaseModel = require('../models/case.model');
const caseQueue = require('../queues/case.queue');
const EvidenceModel = require('../models/evidence.model');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const alertQueue = require('../queues/alert.queue')
const auditService = require('../services/auditService')
const redisClient = require('../config/redis.config')

exports.createCase = async (caseData, evidenceData, user, req) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = user?.id || user?._id;

        // 1. Geocoding Logic with Optional Chaining
        // Case A: Have address string, need coordinates [lng, lat]
        if (!caseData?.location?.coordinates && caseData?.location?.address) {
            const geoRes = await geocoder.geocode(caseData.location.address)

            if (geoRes?.[0]) {
                caseData.location.coordinates = [
                    geoRes[0].longitude,
                    geoRes[0].latitude
                ];
            }
        }

        // Case B: Have coordinates, need formattedAddress string
        if (caseData?.location?.coordinates && !caseData?.location?.address) {
            const [lng, lat] = caseData.location.coordinates;
            const geoRes = await geocoder.reverse({ lat, lon: lng });

            if (geoRes?.[0]) {
                // formattedAddress is built-in to most geocoder responses
                caseData.location.address = geoRes[0].formattedAddress;
            }
        }

        // Final address fallback
        if (!caseData?.location?.address) {
            caseData.location = {
                ...caseData?.location,
                address: "Unknown Location"
            };
        }

        const isAnonymous = caseData.isAnonymous === true

        // 2. Initial Case Creation
        const [createdCase] = await CaseModel.create([{
            ...caseData,
            isAnonymous,
            reporters: [userId],
            status: "REPORTED"
        }], { session });

        // 3. Evidence Creation
        if (evidenceData) {
            await EvidenceModel.create([{
                ...evidenceData,
                caseId: createdCase?._id,
                submittedBy: userId,
                verificationStatus: 'PENDING'
            }], { session });
        }

        // 4. Audit Log (using optional chaining for request object)
        await auditService.recordLog({
            user: { _id: userId },
            action: "CASE_REPORTED",
            entityId: createdCase?._id,
            entityType: "Case",
            before: {},
            after: {
                status: "REPORTED",
                crimeType: createdCase?.crimeType,
                location: caseData?.location?.address
            },
            context: {
                ip: req?.ip || "unknown",
                userAgent: req?.headers?.["user-agent"] || "unknown",
                source: "WEB_APP"
            }
        });

        await session.commitTransaction();

        // 5. Worker Queue
        await caseQueue.add("PROCESS_NEW_REPORT", {
            caseId: createdCase?._id,
            location: createdCase?.location,
            crimeType: createdCase?.crimeType,
            address: caseData?.location?.address,
            userId: userId
        })

        return createdCase;

    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        throw new ApiError(error?.statusCode || 500, error?.message || "Internal Server Error");
    } finally {
        session.endSession();
    }
}


exports.getOfficerCases = async (officerId, query = {}) => {
    const { status, priority, limit = 10, page = 1 } = query;

    let filter = {
        isDeleted: false,
        $or: [
            { assignedOfficer: officerId },
            { status: "REPORTED" }
        ]
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const cases = await CaseModel.find(filter)
        .sort({ status: 1, updatedAt: -1 })
        .select('title status priority crimeType location caseNumber createdAt')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('reporters', 'name contact')
        .lean();

    const total = await CaseModel.countDocuments(filter);

    return {
        cases,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        totalCases: total
    };
}


exports.mergeToExistingCase = async (masterCaseId, newCaseId, userId, evidenceData = null) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!masterCaseId) {
            throw new ApiError(400, "Invalid master case");
        }

        const updatedMaster = await CaseModel.findByIdAndUpdate(
            masterCaseId,
            {
                $addToSet: { reporters: userId },
                $inc: { clusterSize: 1 } // Increment cluster count
            },
            { new: true, session }
        );

        // 2. Link the New Case to the Master Case (The Merge)
        await CaseModel.findByIdAndUpdate(newCaseId, {
            clusterHeadId: masterCaseId,
            isClustered: true,
            status: "MERGED"
        }, { session });

        // 3. Re-link evidence if provided
        if (evidenceData) {
            await EvidenceModel.create([{
                ...evidenceData,
                caseId: masterCaseId, // Points to the main thread
                submittedBy: userId
            }], { session });
        }

        await session.commitTransaction();
        return updatedMaster;
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(error.statusCode || 500, error.message)
    } finally {
        session.endSession();
    }
}


exports.updateStatus = async (caseId, newStatus, reason, user) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Get snapshot BEFORE for Audit Log
        const currentCase = await CaseModel.findById(caseId).session(session);
        if (!currentCase) {
            throw new ApiError(404, "Case Not Found");
        }

        // 2. Validation & Auth
        const validStatuses = ['REPORTED', 'UNDER_REVIEW', 'INVESTIGATION', 'HEARING', 'JUDGEMENT', 'CLOSED'];
        if (!validStatuses.includes(newStatus)) {
            throw new ApiError(400, `Invalid status: ${newStatus}`);
        }

        if (user.role !== "ADMIN" && currentCase.assignedOfficer?.toString() !== user.id) {
            throw new ApiError(403, "You are not authorized to update this case status.");
        }

        // 3. Perform Update
        const updatedCase = await CaseModel.findByIdAndUpdate(
            caseId,
            {
                $set: { status: newStatus },
                $push: {
                    history: {
                        status: newStatus,
                        changedBy: user.id,
                        reason: reason || "No reason provided",
                        timestamp: new Date()
                    }
                }
            },
            { new: true, session, runValidators: true }
        ).populate('assignedOfficer', 'name badgeNumber');


        await auditService.recordLog({
            user: { _id: user.id || user._id },
            action: "STATUS_CHANGE",
            entityId: caseId,
            before: { status: currentCase.status },
            after: { status: updatedCase.status },
            context: {
                reason: reason || "Standard process update",
                source: "OFFICER_PANEL"
            }
        });

        await session.commitTransaction();

        // 5. QUEUE NOTIFICATIONS (Outside transaction for performance)
        if (updatedCase.reporters && updatedCase.reporters.length > 0) {
            const notificationJobs = updatedCase.reporters.map(reporterId =>
                alertQueue.add("STATUS_UPDATE_EVENT", {
                    type: "STATUS_UPDATE",
                    data: {
                        userId: reporterId,
                        caseId: updatedCase._id,
                        message: `Case Update: Your report status has been changed to ${newStatus}.`
                    }
                })
            );
            await Promise.all(notificationJobs);
        }

        return updatedCase;

    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        throw new ApiError(error.statusCode || 500, error.message);
    } finally {
        session.endSession();
    }
}


exports.getUserCases = async (userId, options = {}) => {
    const {
        page = 1,
        limit = 10,
        search,
        status,
        crimeType,
        priority,
        startDate,
        endDate
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Base query
    const query = {
        reporters: userId,
        isDeleted: false
    };

    // Search by Title or Case Number (Regex)
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { caseNumber: { $regex: search, $options: 'i' } }
        ];
    }

    // Exact Filters
    if (status) query.status = status;
    if (crimeType) query.crimeType = crimeType.toLowerCase();
    if (priority) query.priority = priority;

    //Date Range Filter (createdAt)
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [cases, total] = await Promise.all([
        CaseModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("assignedOfficer", "name badgeNumber")
            .select("caseNumber title status priority crimeType createdAt assignedOfficer"),
        CaseModel.countDocuments(query)
    ]);

    return {
        cases,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit) || 1
        }
    };
};



exports.getCaseById = async (caseId, user) => {
    const foundCase = await CaseModel.findOne({ _id: caseId, isDeleted: false })
        .populate("assignedOfficer", "name badgeNumber rank")
        .select(user.role === 'CITIZEN' ? "-aiInsights" : "")
        .lean();

    if (!foundCase) throw new ApiError(404, "Case not found.");

    const isOwner = foundCase.reporters.some(id => id.toString() === user.id.toString());
    const isStaff = ["ADMIN", "OFFICER"].includes(user.role?.toUpperCase());

    if (!isOwner && !isStaff) {
        throw new ApiError(403, "Not authorized to view this case.");
    }

    return foundCase;
}


exports.getNearbyCases = async (coordinates, radius = 5, query = {}) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {
        status: { $ne: "CLOSED" }
    };

    // Validation check to prevent NaN in MongoDB query
    if (Array.isArray(coordinates) && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
        const [lng, lat] = coordinates;
        filter.location = {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: Number(radius) * 1000 // Ensure radius is a number
            }
        };
    }

    const cases = await CaseModel.find(filter)
        .select("title crimeType location createdAt status")
        .skip(skip)
        .limit(limit)
        .lean();

    // Use countDocuments for better compatibility
    let total;
    try {
        total = await CaseModel.countDocuments(filter);
    } catch (e) {
        total = await CaseModel.countDocuments({ status: { $ne: "CLOSED" } });
    }

    return {
        cases,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};



