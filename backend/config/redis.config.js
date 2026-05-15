const Redis = require("ioredis");

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: 'default', 
    password: process.env.REDIS_PASSWORD, 
    maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisConfig);

// This is more reliable than a simple console.log
redisConnection.on("connect", () => {
    console.log("🚀 Redis Cloud: Connection Established");
});

redisConnection.on("error", (err) => {
    console.error("❌ Redis Cloud: Connection Failed", err);
});

module.exports = redisConnection;