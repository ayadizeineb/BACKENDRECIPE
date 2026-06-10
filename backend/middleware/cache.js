const redis = require('../config/redis');

const cache = (durationSeconds) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await redis.get(key);
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }

            // Intercept res.json
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Only cache successful JSON responses
                if (res.statusCode === 200) {
                    redis.set(key, JSON.stringify(body), 'EX', durationSeconds).catch(err => {
                        console.warn('[Cache] Set failed:', err.message);
                    });
                }
                return originalJson(body);
            };

            next();
        } catch (err) {
            console.warn('[Cache] Get failed, bypassing cache:', err.message);
            next();
        }
    };
};

module.exports = cache;
