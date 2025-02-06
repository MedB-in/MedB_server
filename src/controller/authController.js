const catchAsync = require("../util/catchAsync");
const authService = require("../services/authService");
const ms = require("ms");

const dev = process.env.NODE_ENV === "dev";

// Login Controller
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const { accessToken, refreshToken, userDetails, menuData } = await authService.loginUser(email, password);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: !dev,
        maxAge: ms(process.env.REFRESH_TOKEN_LIFE),
        ...(dev ? {} : { sameSite: 'None' })
    });
    return res.status(200).json({ accessToken, userDetails, menuData });
});


// Refresh Access Token Controller
exports.refreshAccessToken = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({ accessToken });
});


// Logout Controller
exports.logout = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: !dev,
    });

    res.sendStatus(200);
});