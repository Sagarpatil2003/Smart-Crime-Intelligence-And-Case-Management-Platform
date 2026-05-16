const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisConnection = require('../config/redis.config'); // Your existing connection

// Configure the Redis-backed limiter
const limiter = rateLimit({
  // Use Redis to store the hit counts
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
    prefix: "rl:", // Optional: prefixes keys in Redis with 'rl:' to keep them organized
  }),
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Security Alert: Too many requests. Please try again in 15 minutes.",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

module.exports = limiter







