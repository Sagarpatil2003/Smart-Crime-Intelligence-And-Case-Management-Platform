
const parseLocation = (req, res, next) => {
    if (req.body.location && typeof req.body.location === 'string') {
        try {
            req.body.location = JSON.parse(req.body.location);
        } catch (error) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid JSON format for location" 
            })
        }
    }
    next()
}

module.exports = parseLocation
