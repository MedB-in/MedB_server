const mongoose = require('mongoose');
const env = require('../../utils/validateEnv');
const ms = require('ms');

const errorLogSchema = new mongoose.Schema(
  {
    message: String,
    level: String,
    stack: String,
    clientIp: String,
    body: Object,
    user: Object,
    statusCode: Number,
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

const expirationSeconds = ms(env.ERROR_LOG_EXPIRATION); 

errorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: expirationSeconds });

const Log = mongoose.model('ErrorLog', errorLogSchema);

module.exports = Log;
