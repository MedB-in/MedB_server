const catchAsync = require("../utils/catchAsync");
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


// Register Controller
exports.register = catchAsync(async (req, res, next) => {
    const { firstName, middleName, lastName, email, contactNo, password, confirmPassword } = req.body;
    try {
        await authService.registerUser(firstName, middleName, lastName, contactNo, email, password, confirmPassword);
        return res.status(200).json({ message: "User registered successfully." });
    } catch (error) {
        return next(error);
    }
});

// Forgot Password Controller
exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.params;

    await authService.forgotPassword(email);
    return res.status(200).json({ message: "Password reset code sent successfully" });
});

// Reset Password Controller
exports.resetPassword = catchAsync(async (req, res, next) => {
    const { email,code, password, confirmPassword } = req.body;
    await authService.resetPassword(email, code, password, confirmPassword);
    return res.status(200).json({ message: "Password reset successfully" });
});


//Verify Email Controller
exports.verifyEmail = catchAsync(async (req, res, next) => {
    const { token, userId } = req.params;
    await authService.verifyEmail(token, userId);
    return res.status(200).json({ message: "Email verified successfully" });
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