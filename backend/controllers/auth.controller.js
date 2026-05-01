const authService = require('../services/auth.service')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')

const cookieOptions = {
    httpOnly: true,
    secure: false, // MUST be false for localhost
    sameSite: "Lax", // use Lax (Strict can block)
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

exports.register = catchAsync(async (req, res) => {
    console.log("Full Request Body:", JSON.stringify(req.body, null, 2))
    const user = await authService.registerUser(req.body)
    
    const response = new ApiResponse(201, user, "User registered successfully")
    console.log(response)
    res.status(response.statusCode).json(response)
})


exports.login = catchAsync(async (req, res) => {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);


    res.cookie('refreshToken', refreshToken, cookieOptions)
        .status(200)
        .json(new ApiResponse(200, { user, accessToken }, "Login successful"));
})


exports.logout = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken; // Use optional chaining

    if (token) {
        // Only attempt DB deletion if token exists
        try {
            await authService.logoutUser(token);
        } catch (err) {
            console.error("Token already gone from DB");
        }
    }

    // ALWAYS clear the cookie so the frontend can't use it again
    res.clearCookie('refreshToken', cookieOptions)
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});


exports.refreshAccessToken = catchAsync(async (req, res) => {
    // cookie-parser makes this available
    const token = req.cookies.refreshToken;

    if (!token) {
        throw new ApiError(401, "Refresh token missing");
    }

    const { accessToken, newRefreshToken, user } = await authService.refreshAccessToken(token);

    // Optional: Rotate the refresh token for even better security
    res.cookie('refreshToken', newRefreshToken, cookieOptions)
        .status(200)
        .json(new ApiResponse(200, { accessToken, user }, "Token refreshed"))
});