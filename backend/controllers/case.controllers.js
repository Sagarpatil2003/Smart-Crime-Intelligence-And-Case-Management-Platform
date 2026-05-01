const catchAsync = require('../utils/catchAsync')
const caseService = require('../services/case.service')
const ApiResponse = require('../utils/ApiResponse');
const UserModel = require('../models/user.model');
const alertService = require('../services/alert.service');
const ApiError = require("../utils/ApiError")
const caseQueue = require("../queues/case.queue")
const auditService = require("../services/auditService")
const dashboardService = require("../services/dashboard.service")
const CaseModel = require('../models/case.model');


exports.createCase = catchAsync(async (req, res) => {
    const { evidence, ...caseData } = req.body;

    if (req.isDuplicate && req.duplicateCaseId) {
        const mergedCase = await caseService.mergeToExistingCase(
            req.duplicateCaseId,
            null,
            req.user.id,
            evidence
        );
        // Ensure mergedCase exists before adding to queue
        if (!mergedCase) {
            return res.status(404).json(new ApiResponse(404, null, "Existing case not found to merge"));
        }

        await caseQueue.add("case-processing", {
            caseId: mergedCase._id,
            location: mergedCase.location,
            crimeType: mergedCase.crimeType,
            isMerged: true
        });


        return res.status(200).json(
            new ApiResponse(200, mergedCase, "Incident linked to existing case")
        );
    }

    const newCase = await caseService.createCase(caseData, evidence, req.user);

    await caseQueue.add("case-processing", {
        caseId: newCase._id,
        location: newCase.location,
        crimeType: newCase.crimeType,
        isMerged: false
    });
    console.log("Hit the case")
    return res.status(201).json(
        new ApiResponse(201, newCase, "Case created successfully")
    );
});


exports.updateOfficerLocation = catchAsync(async (req, res) => {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
        throw new ApiError(400, "Invalid location coordinates");
    }

    // 1. Update MongoDB (For Assignment Logic)
    // We use [lng, lat] because MongoDB is GeoJSON compliant
    const updatedUser = await UserModel.findByIdAndUpdate(
        req.user.id,
        {
            location: {
                type: "Point",
                coordinates: [lng, lat]
            }
        },
        { new: true }
    );

    // CRITICAL: Update Redis (For Real-time Proximity Alerts)
    // This ensures the officer is "visible" to the sendClusterAlert logic
    await alertService.storeUserLocation(req.user.id, updatedUser.location);

    res.status(200).json({
        success: true,
        message: "Location updated across all systems",
        data: {
            coordinates: updatedUser.location.coordinates
        }
    });
});


exports.updateStatus = catchAsync(async (req, res) => {
    const { status, reason } = req.body

    // Pass the reason to the service so it can be saved in the Case History
    const updatedCase = await caseService.updateStatus(
        req.params.id,
        status,
        reason,
        req.user
    )

    res.status(200).json(new ApiResponse(200, updatedCase, `Case status updated to ${status}`))
})


exports.getMyCase = catchAsync(async (req, res) => {
    // Extract all possible filters from the URL query string
    const { page, limit, search, status, crimeType, priority, startDate, endDate } = req.query;

    const result = await caseService.getUserCases(req.user.id, {
        page,
        limit,
        search,
        status,
        crimeType,
        priority,
        startDate,
        endDate
    });

    res.status(200).json(new ApiResponse(200, result, "Cases retrieved successfully."));
});


exports.getCaseDetails = catchAsync(async (req, res) => {
    const caseData = await caseService.getCaseById(req.params.id, req.user)
    res.status(200).json(new ApiResponse(200, caseData, "Case details fetched."))
})


exports.getCaseTimeline = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userRole = req.user.role; // Extract role from auth middleware

    const data = await auditService.getCaseLogs(id, userRole, req.query);

    res.status(200).json({
        success: true,
        data: data.logs,
        pagination: {
            page: Number(req.query.page) || 1,
            total: data.total
        }
    });
});


exports.updateCaseStatus = catchAsync(async (req, res) => {
    const { id } = req.params;

    // 1. Get the data BEFORE the update (use .lean() for a clean object)
    const beforeUpdate = await CaseModel.findById(id).lean();
    if (!beforeUpdate) {
        throw new ApiError(404, "Case not found");
    }
    // 2. Perform the update
    const afterUpdate = await CaseModel.findByIdAndUpdate(
        id,
        { status: req.body.status },
        { new: true }
    ).lean();

    // 3. RECORD THE LOG
    await auditService.recordLog({
        user: req.user, // From your auth middleware
        action: "STATUS_UPDATED",
        entityId: id,
        before: { status: beforeUpdate.status },
        after: { status: afterUpdate.status },
        context: {
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        }
    });

    res.status(200).json(new ApiResponse(200, afterUpdate, "Status updated"));
});


exports.getNearbyCases = catchAsync(async (req, res) => {
    const { lat, lng, page, limit } = req.query;

    const data = await caseService.getNearbyCases(
        [Number(lng), Number(lat)],
        { page, limit }
    )

    res.status(200).json(new ApiResponse(200, data, "all cases"))
})

// DASHBOARD
exports.getCityCrimeStats = catchAsync(async(req, res) => {
    const userId = req.user.id
    const stateData = await dashboardService.getUserMetrics(userId )
    res.status(200).json(new ApiResponse(200, stateData, "user case states" ))
})

/**
 * @desc Get User Dashboard Data (Metrics + City Crime Graph)
 * @route GET /api/v1/dashboard/user-summary
 */

exports.getUserDashboard = catchAsync(async (req, res) => {
    
    const user = await UserModel.findById(req.user.id).select('location');
    4
    if (!user || !user.location || !user.location.coordinates) {
        throw new ApiError(400, "User location is required for dashboard analytics.");
    }

    const [lng, lat] = user.location.coordinates;

    // 2. Fetch Metrics and Graph Data in parallel for better performance
    const [metrics, cityCrimeStats] = await Promise.all([
        dashboardService.getUserMetrics(req.user.id),
        dashboardService.getTopCrimeTypesInRadius(lng, lat)
    ]);

    // 3. Construct response
    const dashboardData = {
        userMetrics: {
            totalReports: metrics.totalSubmitted || 0,
            activeCases: metrics.active || 0,
            resolvedCases: metrics.resolved || 0
        },
        cityCrimeGraph: cityCrimeStats[0]?.crimes || []
    };

    res.status(200).json(
        new ApiResponse(200, dashboardData, "Dashboard data synchronized successfully.")
    );
});

