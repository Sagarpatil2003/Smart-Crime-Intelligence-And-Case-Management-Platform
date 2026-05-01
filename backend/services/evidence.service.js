const EvidenceModel = require('../models/evidence.model')
const CaseModel = require('../models/case.model')
const ApiError = require("../utils/ApiError")
const auditService = require('../services/auditService')
const redisClient = require("../config/redis.config")
const mongoose = require("mongoose")


exports.getEvidenceByCaseId = async (caseId) => {
    const cacheKey = `evidence:${caseId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const evidence = await EvidenceModel.find({ caseId })
        .sort({ createdAt: -1 })
        .populate("submittedBy", "name role")
        .lean();


    await redisClient.setex(cacheKey, 3600, JSON.stringify(evidence));
}


exports.addEvidence = async (caseId, userId, data) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const evidence = await EvidenceModel.create([{
            caseId,
            submittedBy: userId,
            evidenceType: data.evidenceType,
            fileUrl: data.fileUrl,
            fileMimeType: data.fileMimeType,
            fileSize: data.fileSize,
            verificationStatus: "PENDING"
        }], { session })

        await redisClient.del(`evidence:${caseId}`)
        await auditService.recordLog({
            user: userId,
            action: "EVIDENCE_SUBMITTED",
            entityId: evidence[0]._id,
            entityType: "Evidence",
            after: { status: "PENDING", fileUrl: data.fileUrl },
            context: { caseId }
        }, { session });

        await session.commitTransaction()
        return evidence[0]
    } catch (error) {
        await session.abortTransaction()
        console.log(error)
        throw error
    } finally {
        session.endSession()
    }
}


exports.deleteEvidence = async (caseId, evidenceId, user) => {
    const isAdmin = user.role === 'ADMIN';
    const userId = (user._id || user.id).toString();

    const evidence = await EvidenceModel.findById(evidenceId).setOptions({ withDeleted: true })

    if (!evidence) {
        throw new ApiError(404, "Evidence record not found.");
    }

    const isOwner = evidence.submittedBy.toString() === userId;


    if (!isOwner && !isAdmin && user.role !== 'OFFICER') {
        throw new ApiError(403, "Access Denied: You do not have permission to delete this.");
    }

    let resultMessage = "";
    let logAction = "";


    if (isAdmin) {
        await EvidenceModel.findByIdAndDelete(evidenceId).setOptions({ withDeleted: true });
        resultMessage = "Evidence permanently purged from the database.";
        logAction = "EVIDENCE_HARD_DELETE";
    } else {

        if (evidence.isDeleted) {
            throw new ApiError(400, "Evidence is already in the trash.");
        }

        evidence.isDeleted = true;
        evidence.deletedAt = new Date();
        await evidence.save();

        resultMessage = "Evidence moved to trash.";
        logAction = "EVIDENCE_SOFT_DELETE";
    }


    await auditService.recordLog({
        user,
        action: logAction,
        entityId: caseId,
        entityType: "Case",
        before: {
            id: evidence._id,
            type: evidence.evidenceType,
            status: evidence.verificationStatus
        },
        after: {
            status: isAdmin ? "PERMANENTLY_DELETED" : "ARCHIVED"
        },
        context: { evidenceId }
    });

    return { success: true, message: resultMessage };
}


exports.addWitness = async (caseId, userId, data, context = {}) => {
    let session = await mongoose.startSession()
    session.startTransaction()
    try {
        const [witness] = await EvidenceModel.create([{
            caseId,
            submittedBy: userId,
            evidenceType: 'WITNESS_STATEMENT',
            witnessInfo: {
                name: data.name,
                contact: data.contact,
                statement: data.statement,
                address: data.address,
                isVerified: false
            }
        }], { session })

        let auditResult = await auditService.recordLog({
            user: { _id: userId },
            action: "WITNESS_ADDED",
            entityId: caseId,
            entityType: "Case",
            before: {},
            after: {
                evidenceId: witness._id,
                type: "WITNESS_STATEMENT",
                witnessName: data.name,
                contact: data.contact
            },
            context: {
                source: "WITNESS_MODULE",
                ip: context.ip || "unknown",
                userAgent: context.userAgent || "unknown"
            }
        }, { session });

        console.log("Audit Log Created:", auditResult);
        await session.commitTransaction()
        return witness;
    } catch (error) {
        await session.abortTransaction()
        console.log(error)
        throw error
    } finally {
        await session.endSession()
    }
}


exports.getWitnessesByCase = async (caseId) => {
    return await EvidenceModel.find({
        caseId,
        evidenceType: "WITNESS_STATEMENT"
    })
        .populate('submittedBy', 'name role')
        .sort({ createdAt: -1 })
        .lean()
}
