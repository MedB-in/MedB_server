const { rateLimit } = require("express-rate-limit");
const AppError = require("./appError");

// Rate limiter (max 500 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // Limit each IP to 500 requests per `window` (per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, __, ___, options) => {
    throw new AppError({
      statusCode: options.statusCode || 500,
      message: `Too many requests!`
    });
  },
});

module.exports = limiter;
