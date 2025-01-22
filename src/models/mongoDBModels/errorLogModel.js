const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    message: String,
    level: String,
    stack: String,
    clientIp: String,
    url: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const expirationDays = process.env.ERROR_LOG_EXPIRATION_DAYS || 7; // Default to 7 days
const expirationSeconds = expirationDays * 24 * 60 * 60;

errorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: expirationSeconds });

const Log = mongoose.model('ErrorLog', errorLogSchema);

module.exports = Log;
