const redisClient = require('../config/redis.config')
const ApiError = require("../utils/ApiError")
const CaseModel = require("../models/case.model")
const mongoose = require("mongoose")

exports.getTopCrimeTypesInRadius = async (lng, lat) => {
    // 1. Cache Key (rounded for ~11km precision)
    const cacheKey = `crime_analytics:${parseFloat(lng).toFixed(1)}:${parseFloat(lat).toFixed(1)}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const result = await CaseModel.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "dist.calculated",
                    maxDistance: 500000, // 500km
                    spherical: true,
                    query: {
                        isDeleted: false,
                        createdAt: { $gte: threeMonthsAgo }
                    }
                }
            },
            {
                $facet: {
                    // --- FACET 1: STATS FOR PIE/BAR CHART (Top Crime Types) ---
                    totalCount: [{ $count: "count" }],
                    topCrimes: [
                        {
                            $group: {
                                _id: { $toLower: "$crimeType" },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    // --- FACET 2: DISTANCE BUCKETING (The "Next Level" Logic) ---
                    distanceDistribution: [
                        {
                            $bucket: {
                                groupBy: "$dist.calculated",
                                boundaries: [0, 50000, 150000, 500001], // Meters: 0-50km, 50-150km, 150-500km
                                default: "Other",
                                output: { count: { $sum: 1 } }
                            }
                        },
                        {
                            $project: {
                                range: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$_id", 0] }, then: "0-50 km" },
                                            { case: { $eq: ["$_id", 50000] }, then: "50-150 km" },
                                            { case: { $eq: ["$_id", 150000] }, then: "150-500 km" }
                                        ],
                                        default: "Out of Range"
                                    }
                                },
                                count: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            },
            { $unwind: { path: "$totalCount", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    // Mapping the Top Crimes with Percentages
                    crimeTypes: {
                        $map: {
                            input: "$topCrimes",
                            as: "item",
                            in: {
                                label: { $toUpper: "$$item._id" },
                                total: "$$item.count",
                                percentage: {
                                    $round: [
                                        { $multiply: [{ $divide: ["$$item.count", { $ifNull: ["$totalCount.count", 1] }] }, 100] },
                                        1
                                    ]
                                }
                            }
                        }
                    },
                    // Including the Distance Buckets in the final object
                    distanceStats: "$distanceDistribution"
                }
            }
        ]);

        const finalData = result[0] || { crimeTypes: [], distanceStats: [] };

        // Save to Redis (30 mins)
        await redisClient.set(cacheKey, JSON.stringify(finalData), "EX", 1800);

        return finalData;
    } catch (error) {
        console.error("Aggregation Error:", error);
        throw error;
    }
};

exports.getUserMetrics = async (userId) => {
    const cacheKey = `stats:${userId}`;

    try {

        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const stats = await CaseModel.aggregate([
            { $match: { reporters: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalSubmitted: { $sum: 1 },
                    activeCases: { $sum: { $cond: [{ $ne: ["$status", "CLOSED"] }, 1, 0] } },
                    resolvedCases: { $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] } }
                }
            }
        ]);

        // If no cases exist, stats will be [], so stats[0] is undefined
        const result = stats[0] || { totalSubmitted: 0, activeCases: 0, resolvedCases: 0 };


        await redisClient.set(cacheKey, JSON.stringify(result), "EX", 3600);
        return result;
    } catch (error) {
        console.log("ACTUAL ERROR:", error); // Check your terminal for this!
        throw new ApiError(500, error.message || "Unable to load dashboard statistics.");
    }
};

