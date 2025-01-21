const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  level: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  clientIp: { type: String, required: true },
  url: { type: String, required: true },
  stack: String,
});

const ErrorLog = mongoose.model('ErrorLog', logSchema);

module.exports = ErrorLog;
