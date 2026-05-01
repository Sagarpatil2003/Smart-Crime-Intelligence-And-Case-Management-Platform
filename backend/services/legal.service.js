const LegalRecordModel = require("../models/legalRecord.model")
const Case = require("../models/case.model")
const ApiError = require("../utils/ApiError")
const alertQueue = require("../queues/alert.queue")
const UserModel = require("../models/user.model")



/**
 * @param {String} caseId - The ID of the Case
 * @param {String} lawyerId - the Id of authenticated lawyer
 * @param {String} commentText - The actual comment content
 */

exports.addLawyerComment = async (caseId, lawyerId, commentText) => {

    const [existingCase, lawyer] = await Promise.all([
        Case.findById(caseId),
        UserModel.findById(lawyerId).select('name')
    ])

    if (!existingCase) throw new ApiError(404, "Case not found.")
    if (!lawyer) throw new ApiError(404, "Lawyer not found")

    const updatedRecord = await LegalRecordModel.findOneAndUpdate(
        { caseId },
        {
            $push: {
                legalComments: {
                    lawyer: lawyerId,
                    comment: commentText,
                    createdAt: new Date()
                }
            }
        },
        {
            new: true, // Return the updated document
            upsert: true, // Create it if it doens't exist
            runValidators: true //It ensures the Case exists before trying to comment on it.
        }
    ).populate("legalComments.lawyer", "name email role")

    await alertQueue.add("legal-comment-alert", {
        type: "ADVOCATE_COMMENT",
        data: {
            caseId: existingCase._id,
            lawyerName: lawyer.name
        }
    })

    return updatedRecord

}


/**
 * @desc Get legal history for a specific case
 */
exports.getLegalRecordByCase = async (caseId) => {
    let record = await LegalRecordModel.findOne({ caseId })
        .populate("legalComments.lawyer", "name role")
        .populate("hearings.judge", "name")
        .populate("caseId", "caseNumber title status")

    if (!record) throw new ApiError(404, "No legal records gound for thid case.")
    return record
}


/**
 * @desc Schedule a new hearing
 */
exports.scheduleHearing = async (caseId, hearingDate) => {
    const record = await LegalRecordModel.findOneAndUpdate(
        { caseId },
        { $push: { hearings: hearingData } },
        { upsert: true, new: true, runValidators: true }
    )
  
    return record
}


/**
 * @desc Close case with Final Verdict
 */
exports.closeCaseWithVerdict = async (caseId, verdictData) => {
    let record = await LegalRecordModel.findOneAndUpdate(
        {caseId},
        {
            finalVerdict: {...verdictData , closedAt: new Date()},
            appealStatus: "NONE"
        },
        {new: true, runValidators: true}
    )

    await Case.findByIdAndUpdate(caseId, {status: "CLOSED"})
    return record;
}