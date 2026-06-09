// backend/controllers/auth.controller.js
const authService = require('../services/auth.service')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

const cookieOptions = {
    httpOnly: true,
    secure: true, 
    sameSite: "None", 
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.register = catchAsync(async (req, res) => {
    console.log("Full Request Body:", JSON.stringify(req.body, null, 2))
    const user = await authService.registerUser(req.body)

    const response = new ApiResponse(201, user, "User registered successfully")
    res.status(response.statusCode).json(response)
})

exports.login = catchAsync(async (req, res) => {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

    res.cookie('refreshToken', refreshToken, cookieOptions)
        .status(200)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Login successful"));
})

exports.logout = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (token) {
        try {
            await authService.logoutUser(token);
        } catch (err) {
            console.error("Token already gone from DB");
        }
    }

    res.clearCookie('refreshToken', cookieOptions)
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

exports.refreshAccessToken = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken || req.headers['x-refresh-token'];

    if (!token) {
        throw new ApiError(401, "Session verification failed: Refresh token missing from channels");
    }

    const { accessToken, newRefreshToken, user } = await authService.refreshAccessToken(token);

    // Normalize user identity configuration parameters explicitly to fit React state requirements
    const formattedUser = {
        id: user._id || user.id,
        name: user.name,
        role: user.role
    };

    res.cookie('refreshToken', newRefreshToken, cookieOptions)
        .status(200)
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken, user: formattedUser }, "Token refreshed successfully"));
});