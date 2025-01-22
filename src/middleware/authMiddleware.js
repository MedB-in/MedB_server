const jwt = require('jsonwebtoken');
const userModel = require('../models/sqlModels/userModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const env = require('../util/validateEnv');

const authMiddleware = catchAsync(async (req, res, next) => {

    if (!req.headers.authorization) {
        throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid access token' });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    const userId = decodedToken.userId;
    const user = await userModel.findById(userId);

    if (!user) {
        throw new AppError({ name: 'Unauthorized', statusCode: 401, message: 'Invalid token' });
    }

    req.user = user;
    next();
});

module.exports = authMiddleware;
