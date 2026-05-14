const redisClient = require('../config/redis.config')
const ApiError = require("../utils/ApiError")
const CaseModel = require("../models/case.model")
const mongoose = require("mongoose")

exports.getTopCrimeTypesInRadius = async (lng, lat) => {
    const cacheKey = `crime_analytics_v2:${parseFloat(lng).toFixed(1)}:${parseFloat(lat).toFixed(1)}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); // Extended to 6 months for trends

        const result = await CaseModel.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "dist.calculated",
                    maxDistance: 500000,
                    spherical: true,
                    query: { isDeleted: false, createdAt: { $gte: sixMonthsAgo } }
                }
            },
            {
                $facet: {
                    totalCount: [{ $count: "count" }],
                    // 1. Existing Top Crimes
                    topCrimes: [
                        { $group: { _id: { $toLower: "$crimeType" }, count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    // 2. NEW: Monthly Trends
                    monthlyTrends: [
                        {
                            $group: {
                                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { "_id.year": 1, "_id.month": 1 } },
                        { $limit: 6 }
                    ],
                    // 3. NEW: Resolution Status
                    statusBreakdown: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    distanceDistribution: [
                        {
                            $bucket: {
                                groupBy: "$dist.calculated",
                                boundaries: [0, 50000, 150000, 500001],
                                default: "Other",
                                output: { count: { $sum: 1 } }
                            }
                        }
                    ]
                }
            },
            { $unwind: "$totalCount" },
            {
                $project: {
                    crimeTypes: {
                        $map: {
                            input: "$topCrimes",
                            as: "item",
                            in: {
                                label: { $toUpper: "$$item._id" },
                                total: "$$item.count"
                            }
                        }
                    },
                    trends: {
                        $map: {
                            input: "$monthlyTrends",
                            as: "t",
                            in: {
                                month: "$$t._id.month",
                                count: "$$t.count"
                            }
                        }
                    },
                    statusStats: "$statusBreakdown",
                    distanceStats: "$distanceDistribution"
                }
            }
        ]);

        const finalData = result[0] || { crimeTypes: [], trends: [], statusStats: [] };
        await redisClient.set(cacheKey, JSON.stringify(finalData), "EX", 1800);
        return finalData;
    } catch (error) {
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
                    activeCases: { $sum: { $cond: [{ $ne: ["$status", 'CLOSED'] }, 1, 0] } },
                    resolvedCases: { $sum: { $cond: [{ $eq: ["$status", 'CLOSED'] }, 1, 0] } }
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

