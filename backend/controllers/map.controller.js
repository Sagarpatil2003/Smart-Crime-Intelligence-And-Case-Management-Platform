const mapService = require("../services/map.service")
const ApiResponse = require("../utils/ApiResponse")

exports.getHeatmap = async(req, res) => {
    const data = await mapService.getHeatmapData()
    
    res.status(200).json(new ApiResponse(200, data, null))
}


exports.getNearby = async (req, res) => {
    // 1. Extract and Convert to Numbers
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const radius = parseFloat(req.query.radius) || 5;

    // 2. Validation Guard
    if (isNaN(lng) || isNaN(lat)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid coordinates provided"));
    }

    // 3. Call service with verified Numbers
    const data = await mapService.getNearByCrime(lng, lat, radius);
    res.status(200).json(new ApiResponse(200, data, "Nearby cases retrieved"));
};