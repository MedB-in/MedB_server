const mongoose = require('mongoose');
const ms = require('ms');

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

const expirationSeconds = ms(process.env.ERROR_LOG_EXPIRATION); 

errorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: expirationSeconds });

const Log = mongoose.model('ErrorLog', errorLogSchema);

module.exports = Log;
