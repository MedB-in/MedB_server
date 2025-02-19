const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/sqlModels/userModel");
const UserSubscription = require("../models/sqlModels/subscriptionModel");
const ResetPassword = require("../models/mongoDBModels/resetCodeModel");
const Token = require("../models/mongoDBModels/tokenModel");
const env = require("../utils/validateEnv");
const { sequelize } = require('../config/postgresConnection');
const { sendVerificationEmail, sendPasswordResetEmail } = require("./emailServices");

// Generate JWT function
const generateJWT = (payload, secret, expirationTime) => {
    return jwt.sign(payload, secret, { expiresIn: expirationTime });
};


// Service function for user login
exports.loginUser = async (email, password) => {
    if (!email || !password) {
        throw new AppError({ statusCode: 400, message: "Credentials required" });
    }

    // needs optimisation-->create seperate sp for this later

    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError({ statusCode: 401, message: "Invalid User" });
    }

    if (!user.isVerified) {
        throw new AppError({ statusCode: 401, message: "User is not verified" });
    }

    if (!user.isActive) {
        throw new AppError({ statusCode: 401, message: "User is not active" });
    }

    //update lastLoginOn in the sp

    const userId = user.userId;
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new AppError({ statusCode: 401, message: "Invalid Password" });
    }

    const query = `SELECT get_user_menu_subscribed(:userId);`;

    const [data] = await sequelize.query(query, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
    });

    const menuData = data.get_user_menu_subscribed;

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


// Service Function for user registration
exports.registerUser = async (firstName, middleName, lastName, contactNo, email, password, confirmPassword) => {
    // needs optimisation-->create seperate sp for this later
    if (!firstName || !email || !contactNo || !password || !confirmPassword) {
        throw new AppError({ statusCode: 400, message: "Credentials required" });
    }

    if (password !== confirmPassword) {
        throw new AppError({ statusCode: 400, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        throw new AppError({ statusCode: 409, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const transaction = await sequelize.transaction();

    try {
        const user = await User.create({
            firstName,
            middleName,
            lastName,
            email,
            contactNo,
            password: hashedPassword,
            isActive: false,
            lastLoginOn: new Date(),
            isVerified: false,
        }, { transaction });

        await UserSubscription.create({
            userId: user.userId,
            productId: 2, // patient
            startOn: new Date(),
            endOn: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // One year for now. hvae to change accordingly
            isPaid: false,
            createdBy: user.userId,
            createdOn: new Date(),
        }, { transaction });

        try {
            await sendVerificationEmail(firstName, middleName, lastName, user.userId, email, user.loginKey);
        } catch (error) {
            await transaction.rollback();
            throw new AppError({ statusCode: 500, message: "Failed to send verification email. Please try again." });
        }

        await transaction.commit();
        return { message: "User registered successfully. Verification email sent." };
    } catch (error) {
        await transaction.rollback();
        throw new AppError({ statusCode: 500, message: "Registration failed. Please try again." });
    }
};


exports.forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError({ statusCode: 404, message: "User not found" });
    }

    const code = Math.floor(1000 + Math.random() * 9000);

    const resetEntry = await ResetPassword.create({
        userId: user.userId,
        email: user.email,
        code,
    });
    const firstName = user.firstName;
    const middleName = user.middleName;
    const lastName = user.lastName;
    await sendVerificationEmail(firstName, middleName, lastName, user.userId, email, user.loginKey);

    try {
        await sendPasswordResetEmail(user.email, code);
    } catch (error) {
        await ResetPassword.deleteOne({ _id: resetEntry._id });
        throw new AppError({ statusCode: 500, message: "Failed to send email. Please try again later." });
    }

    return { message: "Verification code sent to email." };
};


exports.resetPassword = async (email, code, password, confirmPassword) => {
    if (!email || !code || !password || !confirmPassword) {
        throw new AppError({ statusCode: 400, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        throw new AppError({ statusCode: 400, message: "Passwords do not match" });
    }

    try {
        const resetEntry = await ResetPassword.findOne({ email });

        if (!resetEntry) {
            throw new AppError({ statusCode: 404, message: "Reset code expired or invalid" });
        }

        if (resetEntry.code !== code) {
            throw new AppError({ statusCode: 400, message: "Invalid reset code" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [updated] = await User.update(
            { password: hashedPassword },
            { where: { email } }
        );

        if (updated === 0) {
            throw new AppError({ statusCode: 500, message: "Failed to update password" });
        }

        await ResetPassword.deleteOne({ email });

        return { message: "Password reset successfully." };
    } catch (error) {
        throw new AppError({ statusCode: error.statusCode || 500, message: error.message || "Something went wrong. Please try again." });
    }
};



exports.verifyEmail = async (loginKey, userId) => {
    const [updated] = await User.update(
        { isVerified: true, isActive: true },
        {
            where: {
                loginKey,
                userId,
            }
        }
    );

    if (!updated) {
        throw new AppError({ statusCode: 404, message: "User not found" });
    }
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
