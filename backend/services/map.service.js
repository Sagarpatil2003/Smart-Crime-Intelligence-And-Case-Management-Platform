const CaseModel = require("../models/case.model");

/**
 * Retrieves aggregate geospatial data optimized for heat map rendering layers.
 * Eliminates processing loads from runtime loops.
 */
exports.getHeatmapData = async () => {
    return await CaseModel.aggregate([
        { 
            $match: { 
                status: { $ne: "CLOSED" }, 
                isDeleted: false 
            } 
        }, 
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
                intensity: { $min: ["$intensity", 10] } // Bounds point density spikes
            } 
        }
    ]);
};

/**
 * Fetches incidents near specified coordinates using standard GeoJSON rules.
 */
exports.getNearByCrime = async (lng, lat, radiusInKm, limit = 50) => {
    return await CaseModel.find({
        isDeleted: false,
        status: { $ne: "CLOSED" },
        location: {
            $near: {
                $geometry: { 
                    type: "Point", 
                    coordinates: [Number(lng), Number(lat)] 
                },
                $maxDistance: Number(radiusInKm) * 1000 // Km to meters conversion
            }   
        }
    })
    .limit(Number(limit))
    .select("title description category status location createdAt")
    .lean(); 
};