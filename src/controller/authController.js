const catchAsync = require("../util/catchAsync");
const User = require("../models/sqlModels/userModel");
const Token = require("../models/mongoDBModels/tokenModel");
const AppError = require("../util/appError");
const env = require('../util/validateEnv');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

// Generate JWT function
const generateJWT = (payload, secret, expirationTime) => {
    return jwt.sign(payload, secret, { expiresIn: expirationTime });
};

// Login Controller
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError({ statusCode: 400, message: 'Credentials required' });
    }

    const user = await User.findOne({ where: { email } }); // Sequelize query
    if (!user) {
        throw new AppError({ statusCode: 401, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new AppError({ statusCode: 401, message: 'Invalid credentials' });
    }

    const accessToken = generateJWT(
        { userId: user.userId, role: user.designation },
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_LIFE
    );

    const refreshToken = generateJWT(
        { userId: user.userId, role: user.designation },
        env.REFRESH_TOKEN_SECRET,
        env.REFRESH_TOKEN_LIFE
    );

    // Save refresh token in the MongoDB database
    await Token.findOneAndUpdate(
        { userId: user.userId },
        { $set: { refreshToken } },
        { upsert: true, new: true }
    );

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: ["production", "test"].includes(process.env.NODE_ENV), // Secure in production and test environments
        maxAge: parseInt(env.REFRESH_TOKEN_LIFE) * 1000,
    });

    return res.status(200).json({ accessToken });
});

// Refresh Access Token Controller
exports.refreshAccessToken = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError({ statusCode: 401, message: 'Refresh token not provided' });
    }

    // Verify refresh token
    let decodedToken;
    try {
        decodedToken = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new AppError({ statusCode: 401, message: 'Invalid refresh token' });
    }

    const userId = decodedToken.userId;

    // Check if the refresh token exists in the MongoDB database
    const refreshTokenInDB = await Token.findOne({ userId, refreshToken });
    if (!refreshTokenInDB) {
        throw new AppError({ statusCode: 401, message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateJWT(
        { userId, role: decodedToken.role },
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_LIFE
    );

    return res.status(200).json({ accessToken });
});
