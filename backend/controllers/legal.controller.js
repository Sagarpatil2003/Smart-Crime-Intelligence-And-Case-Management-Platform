const legalService = require('../services/legal.service')
const catchAsync = require('../utils/catchAsync')
const ApiResponse = require('../utils/ApiResponse')

exports.postComment = catchAsync(async (req, res) => {
    const { caseId, comment } = req.body
    const lawyerId = req.user._id
    const result = await legalService.addLawyerComment(caseId, req.user.id, comment)
    res.status(201).json(new ApiResponse(201, result, "Comment logged and officer notified."))
})

exports.getRecord = catchAsync(async (req, res) => {
    const record = await legalService.getLegalRecordByCase(req.params.caseId)
    res.status(200).json(new ApiResponse(200, record, "Legal record retrieved.")) 
})

exports.addHearing = catchAsync(async (req, res) => {
    const {caseId, hearingData, courtroom, notes, judgeId} = req.body
    const data = {hearingData, courtroom, notes, judgeId}
    const result = await legalService.scheduleHearing(caseId, data)
    res.status(201).json(new ApiResponse(201, result, "Hearing scheduled successfully."))
})