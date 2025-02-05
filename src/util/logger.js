const winston = require('winston');
const Transport = require('winston-transport');
const Log = require('../models/mongoDBModels/errorLogModel');
const { loggableStatusCodes } = require('../config/errorCodesConfig');

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
});

// Custom MongoDB transport for storing logs
class MongoDBTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    const logMessage = info;
    
    // Log all errors if the array is empty, otherwise log only specified codes
    if (!loggableStatusCodes.length || (logMessage.statusCode && loggableStatusCodes.includes(logMessage.statusCode))) {
      const log = new Log({
        message: logMessage.message,
        level: logMessage.level,
        stack: logMessage.stack,
        clientIp: logMessage.clientIp,
        url: logMessage.url,
        timestamp: logMessage.timestamp,
        statusCode: logMessage.statusCode || 500, 
      });

      log
        .save()
        .then(() => {
          console.log("Error logged to MongoDB");
          callback();
        })
        .catch((err) => {
          console.error("Failed to log to MongoDB", err);
          callback();
        });
    } else {
      callback();
    }
  }
}

logger.add(new MongoDBTransport());

module.exports = logger;
