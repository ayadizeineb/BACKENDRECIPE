const redis = require('../config/redis');

const invalidateCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[Cache] Invalidated ${keys.length} key(s): ${pattern}`);
        }
    } catch (err) {
        console.warn('[Cache] invalidate failed:', err.message);
    }
};

module.exports = invalidateCache;