const catchAsync = require("../util/catchAsync");
const authService = require("../services/authService");

// Login Controller
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await authService.loginUser(email, password);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: ["production", "test"].includes(process.env.NODE_ENV),
        maxAge: parseInt(process.env.REFRESH_TOKEN_LIFE) * 1000,
    });

    return res.status(200).json({ accessToken });
});


// Refresh Access Token Controller
exports.refreshAccessToken = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({ accessToken });
});
