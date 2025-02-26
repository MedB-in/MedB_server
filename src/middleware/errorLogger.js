const logger = require('../utils/logger');

const errorLogger = (err, req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const requestUrl = req.originalUrl || req.url;
    const user = req.user || {};

    const logData = {
        message: err.message || "Unknown error",
        name: err.name || "Error",
        stack: err.stack || "No stack available",
        url: requestUrl,
        method: req.method,
        body: req.body,
        user: user,
        statusCode: err.statusCode || 500,
        clientIp: clientIp === "::1" ? "127.0.0.1" : clientIp,
    };

    logger.error(logData);

    next(err);
};

module.exports = errorLogger;
