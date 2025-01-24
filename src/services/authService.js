const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../util/appError");
const User = require("../models/sqlModels/userModel");
const Token = require("../models/mongoDBModels/tokenModel");
const env = require("../util/validateEnv");

// Generate JWT function
const generateJWT = (payload, secret, expirationTime) => {
    return jwt.sign(payload, secret, { expiresIn: expirationTime });
};

// Service for user login
exports.loginUser = async (email, password) => {
    if (!email || !password) {
        throw new AppError({ statusCode: 400, message: "Credentials required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError({ statusCode: 401, message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new AppError({ statusCode: 401, message: "Invalid credentials" });
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

    // Save refresh token to MongoDB
    await Token.findOneAndUpdate(
        { userId: user.userId },
        { $set: { refreshToken } },
        { upsert: true, new: true }
    );

    return { accessToken, refreshToken, userId: user.userId };
};

// Service for refreshing the access token
exports.refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AppError({ statusCode: 401, message: "Refresh token not provided" });
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new AppError({ statusCode: 401, message: "Invalid refresh token" });
    }

    const userId = decodedToken.userId;

    const refreshTokenInDB = await Token.findOne({ userId, refreshToken });
    if (!refreshTokenInDB) {
        throw new AppError({ statusCode: 401, message: "Invalid refresh token" });
    }

    // Generate new access token
    const accessToken = generateJWT(
        { userId, role: decodedToken.role },
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_LIFE
    );

    return { accessToken };
};
