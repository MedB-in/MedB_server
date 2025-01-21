const winston = require('winston');
const Transport = require('winston-transport');
const Log = require('../models/mongoDBModels/errorLogModel');

// Create a Winston logger
const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log" }), // File logging
  ],
});

// Custom MongoDB transport for storing logs
class MongoDBTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    // Asynchronously log the error to MongoDB
    const logMessage = info;
    const log = new Log({
      message: logMessage.message,
      level: logMessage.level,
      stack: logMessage.stack,
      clientIp: logMessage.clientIp,
      url: logMessage.url,
      timestamp: logMessage.timestamp,
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
  }
}

// Add MongoDB transport to Winston logger
logger.add(new MongoDBTransport());

module.exports = logger;
