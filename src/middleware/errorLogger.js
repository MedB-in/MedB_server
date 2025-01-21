const logger = require('../util/logger');

const errorLogger = (err, req, res, next) => {
    // Get the client's IP address (can be found in req.ip or req.connection.remoteAddress)
    const clientIp = req.ip || req.connection.remoteAddress;

    // Get the request URL
    const requestUrl = req.originalUrl || req.url;

    // Log the error with relevant details
    logger.error(err.message, {
        stack: err.stack,
        url: requestUrl,
        method: req.method,
        body: req.body,
        statusCode: err.statusCode || 500, // Log status code if available
        clientIp: clientIp === '::1' ? '127.0.0.1' : clientIp
    });

    next(err);
};

module.exports = errorLogger;
