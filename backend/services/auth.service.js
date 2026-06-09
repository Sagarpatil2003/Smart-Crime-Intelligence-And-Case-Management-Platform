// backend/services/auth.service.js
const UserModel = require('../models/user.model')
const RefreshToken = require('../models/refreshToken.model')
const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')

exports.generateToken = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
    return { accessToken, refreshToken }
}

exports.registerUser = async (data) => {
    const { name, email, role, password, location } = data;

    const existing = await UserModel.findOne({ email });
    if (existing) throw new ApiError(409, "Email already in use");

    let finalCoordinates = [0, 0];

    if (location?.coordinates && Array.isArray(location.coordinates)) {
        const lng = parseFloat(location.coordinates[0]);
        const lat = parseFloat(location.coordinates[1]);

        if (!isNaN(lng) && !isNaN(lat)) {
            if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
                finalCoordinates = [lng, lat];
            }
        }
    }

    const userData = {
        name,
        email,
        role,
        password,
        location: {
            type: 'Point',
            coordinates: finalCoordinates,
            address: location?.address || data.address || "" 
        },
    };

    const user = await UserModel.create(userData);
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
};

exports.loginUser = async ({ email, password }) => {
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (user.accountStatus !== "ACTIVE") {
        throw new ApiError(403, `Access denied. Your account is ${user.accountStatus}`);
    }

    const { accessToken, refreshToken } = exports.generateToken(user._id);

    await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    user.lastLoginAt = new Date();
    await user.save();

    return {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, role: user.role }
    };
}

exports.logoutUser = async (token) => {
    await RefreshToken.deleteOne({ token })
}

exports.refreshAccessToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

        const tokenRecord = await RefreshToken.findOne({ user: decoded.id, token: token })
        if (!tokenRecord) throw new ApiError(401, 'Invalid refresh token');

        const user = await UserModel.findById(decoded.id).select("-password")
        if (!user) throw new ApiError(404, "User Not Found")

        // Safe evaluation rotation sequence
        await RefreshToken.deleteOne({ _id: tokenRecord._id });

        const { accessToken, refreshToken: newRefreshToken } = exports.generateToken(decoded.id);

        await RefreshToken.create({
            user: decoded.id,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return { accessToken, newRefreshToken, user };
    } catch (err) {
        // Intercept expired or tampered token crashes cleanly and throw deterministic 401 error codes
        if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
            throw new ApiError(401, "Session verification validation expired. Please re-authenticate.");
        }
        throw err;
    }
}