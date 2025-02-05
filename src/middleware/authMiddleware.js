const jwt = require('jsonwebtoken');
const User = require('../models/sqlModels/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const env = require('../util/validateEnv');

const authMiddleware = catchAsync(async (req, res, next) => {

    if (!req.headers) {
        throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid access token' });
    }

    // get refresh token
    const refreshToken = process.env.NODE_ENV !== 'dev' ? req.cookies.refreshToken : req.headers.cookie.split("=")[1];
    console.log('refreshtoken' + refreshToken);
    console.log('Request:', JSON.stringify(req.cookies, null, 2));

    if (!refreshToken) {
        throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid refresh token' })
    }

    try {
        const token = req.headers.authorization.split(" ")[1];

        const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        const decodedRefreshToken = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)

        const userId = decodedToken.userId == decodedRefreshToken.userId ? decodedRefreshToken.userId : null;

        const user = await User.findOne({ where: { userId } });

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
