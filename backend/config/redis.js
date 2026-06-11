const Redis = require('ioredis');

// Only connect to Redis if REDIS_URL is explicitly provided
// On Render (or any environment without Redis), skip entirely to avoid error floods
if (!process.env.REDIS_URL) {
    // Export a no-op mock so the rest of the app doesn't break
    const mock = {
        ping: async () => { throw new Error('Redis not configured'); },
        get: async () => null,
        set: async () => null,
        del: async () => null,
        on: () => {},
    };
    module.exports = mock;
} else {
    const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
            if (times > 3) return null; // Stop retrying after 3 attempts
            return Math.min(times * 500, 2000);
        },
    });

    redis.on('connect', () => console.log('Redis connected'));
    redis.on('error', (err) => console.warn('Redis error (non-fatal):', err.message));

    module.exports = redis;
}
