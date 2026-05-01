const CaseModel = require('../models/case.model');
const ApiError = require('../utils/ApiError');

const accessGuard = (moduleName) => async (req, res, next) => {

    try {
        // Look for ID in params OR body (since add-comment uses req.body.caseId)
        const caseId = req.params.id || req.body.caseId;
        const userId = req.user._id || req.user.id;
        //  console.log(caseId)
        if (!caseId) {
            throw new ApiError(400, "Case ID is required for access validation.");
        }

        const foundCase = await CaseModel.findById(caseId).lean();
        if (!foundCase || foundCase.isDeleted) {
            throw new ApiError(404, "Case not found.");
        }

        //  Role Bypass: Admins, Officers, AND Lawyers should pass the "Ownership" check
        // Because Lawyers are not "reporters", but they have access to "LEGAL_RECORDS"
        const hasStaffAccess = ['ADMIN', 'OFFICER', 'LAWYER'].includes(req.user.role);
        
        if (hasStaffAccess) {
            req.case = foundCase;
            return next();
        }

        //Citizen Ownership Check (Only for CITIZEN role)
        const reporterIds = (foundCase.reporters || []).map(rid => rid.toString());
        const isOwner = reporterIds.includes(userId.toString());

        if (!isOwner) {
            throw new ApiError(403, `Access Denied: You do not have permission for ${moduleName}`);
        }

        req.case = foundCase;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = accessGuard;