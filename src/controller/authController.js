const catchAsync = require("../util/catchAsync");
const { User } = require("../models/sqlModels/userModel");
const AppError = require("../util/appError");
const env = require('../util/validateEnv');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        throw new AppError({ statusCode: 400, message: 'Credentials required' });
    }

    // Check if user exists in the database (SQL query through Sequelize)
    const user = await User.findOne({ where: { email } }); // Sequelize query
    if (!user) {
        throw new AppError({ statusCode: 401, message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new AppError({ statusCode: 401, message: 'Invalid credentials' });
    }

    // Generate an access token
    const accessToken = jwt.sign(
        { userId: user.userId, role: user.designation }, // Adjust payload according to your model
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_LIFE }
    );

    // Send back the access token in the response
    return res.status(200).json({ accessToken });
});
