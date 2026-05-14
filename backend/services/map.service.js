const CaseModel = require("../models/case.model")

exports.getHeatmapData = async () => {
    return await CaseModel.aggregate([
        { $match: { status: { $ne: "CLOSED" }, isDeleted: false } }, 
        { 
            $group: { 
                _id: "$location.coordinates", 
                intensity: { $sum: 1 } 
            } 
        },
        { 
            $project: { 
                _id: 0, 
                coordinates: "$_id", 
                intensity: 1 
            } 
        }
    ])
}
// backend/services/map.service.js
exports.getNearByCrime = async (lng, lat, radius, limit = 100) => {
    return await CaseModel.find({
        isDeleted: false,
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: Number(radius) * 1000 // KM to Meters
            }   
        }
    })
    .limit(limit)
    .select("-shareToken")
    .lean();
};