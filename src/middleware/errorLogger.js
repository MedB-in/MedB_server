const logger = require('../util/logger');

const errorLogger = (err, req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const requestUrl = req.originalUrl || req.url;

    logger.error(err.message, {
        stack: err.stack,
        url: requestUrl,
        method: req.method,
        body: req.body,
        statusCode: err.statusCode || 500, 
        clientIp: clientIp === '::1' ? '127.0.0.1' : clientIp,
    });

    next(err);
};

module.exports = errorLogger;
