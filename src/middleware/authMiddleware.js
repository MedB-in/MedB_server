const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const env = require('../utils/validateEnv');
// const User = require('../models/sqlModels/userModel');

const authMiddleware = catchAsync(async (req, res, next) => {

    if (!req.headers) {
        throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid access token' });
    }

    // get refresh token
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid refresh token' })
    }

    try {
        const token = req.headers.authorization.split(" ")[1];

        const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        const decodedRefreshToken = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)

        const userId = decodedToken.userId == decodedRefreshToken.userId ? decodedRefreshToken.userId : null;

        const user = { userId };
        // const user = await User.findOne({ where: { userId } }); // removed db call for user

        if (!userId) {
            throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Access token expired' });
        }
        throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid access token' });
    }
});

module.exports = authMiddleware;
