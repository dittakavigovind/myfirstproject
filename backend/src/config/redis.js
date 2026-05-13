const Redis = require('ioredis');

// Default to memory mock if no Redis URL provided for local dev
let redisClient;
if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => console.log('✅ Redis Connected'));
    redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
} else {
    console.warn('⚠️ No REDIS_URL provided. Using in-memory fallback for local development (Not for Production).');
    
    // Simple polyfill object to not crash code that relies on ioredis methods
    const db = new Map();
    redisClient = {
        get: async (key) => db.get(key) || null,
        set: async (key, val, mode, ttl) => {
            db.set(key, val);
            if (mode === 'EX' && ttl) setTimeout(() => db.delete(key), ttl * 1000);
            return 'OK';
        },
        del: async (key) => {
            const existed = db.has(key);
            db.delete(key);
            return existed ? 1 : 0;
        },
        zadd: async (key, score, member) => {
            // Simplified ZADD
            let arr = db.get(key) || [];
            arr = arr.filter(i => i.member !== member);
            arr.push({ score: Number(score), member });
            arr.sort((a,b) => a.score - b.score);
            db.set(key, arr);
            return 1;
        },
        zrange: async (key, start, stop) => {
            // Simplified ZRANGE
            const arr = db.get(key) || [];
            let s = start;
            const e = stop === -1 ? arr.length : stop + 1;
            return arr.slice(s, e).map(i => i.member);
        },
        zrank: async (key, member) => {
            const arr = db.get(key) || [];
            const idx = arr.findIndex(i => i.member === member);
            return idx !== -1 ? idx : null;
        },
        zrem: async (key, member) => {
            let arr = db.get(key) || [];
            const initialLength = arr.length;
            arr = arr.filter(i => i.member !== member);
            db.set(key, arr);
            return initialLength - arr.length;
        },
        zcount: async (key, min, max) => {
            const arr = db.get(key) || [];
            // Assuming simple count
            return arr.length;
        }
    };
}

module.exports = redisClient;
