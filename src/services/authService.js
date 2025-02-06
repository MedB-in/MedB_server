const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../util/appError");
const User = require("../models/sqlModels/userModel");
const Token = require("../models/mongoDBModels/tokenModel");
const env = require("../util/validateEnv");
const { sequelize } = require('../config/postgresConnection');

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
        throw new AppError({ statusCode: 401, message: "Invalid User" });
    }
    const userId = user.userId;
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new AppError({ statusCode: 401, message: "Invalid Password" });
    }

    //Calling stored procedure
    const query = `SELECT get_user_menu(:userId);`;

    const [data] = await sequelize.query(query, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
    });

    const menuData = data.get_user_menu

    const accessToken = generateJWT(
        { userId: user.userId },
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_LIFE
    );

    const refreshToken = generateJWT(
        { userId: user.userId },
        env.REFRESH_TOKEN_SECRET,
        env.REFRESH_TOKEN_LIFE
    );

    // Save refresh token to MongoDB
    await Token.findOneAndUpdate(
        { userId: user.userId },
        { $set: { refreshToken } },
        { upsert: true, new: true }
    );

    const userDetails = {
        userId: user.userId,
        name: user.name,
        email: user.email,
        loginKey: user.loginKey,
    }

    return { accessToken, refreshToken, userDetails, menuData };
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
        { userId },
        env.ACCESS_TOKEN_SECRET,
        env.ACCESS_TOKEN_LIFE
    );

    return { accessToken };
};

// Service for logging out
exports.logout = async (refreshToken) => {
    if (!refreshToken)
        throw new AppError({ statusCode: 401, message: 'Refresh token not provided' });

    try {
        const { userId } = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
        await Token.findOneAndDelete({ userId })
    } catch {
        throw new AppError({ statusCode: 401, message: "Invalid refresh token" });
    }
};
