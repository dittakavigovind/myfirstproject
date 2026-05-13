const redis = require('../config/redis');

class QueueService {
    /**
     * Set Astrologer Status
     * Statuses: 'online', 'busy', 'offline'
     */
    static async setAstrologerStatus(astrologerId, status) {
        if (!redis) return;
        
        const key = `astro:status:${astrologerId}`;
        if (status === 'offline') {
            await redis.del(key);
            // Optionally clear their queue if they go offline
            await redis.del(`astro:queue:${astrologerId}`);
        } else {
            // Expire status after 1 hour of no heartbeat to prevent ghosting
            await redis.set(key, status, 'EX', 3600);
        }
    }

    static async getAstrologerStatus(astrologerId) {
        if (!redis) return 'offline'; // Fallback
        const status = await redis.get(`astro:status:${astrologerId}`);
        return status || 'offline';
    }

    /**
     * Add user to an astrologer's waitlist
     */
    static async enqueueUser(astrologerId, userId, sessionType) {
        if (!redis) return 1;
        
        const queueKey = `astro:queue:${astrologerId}`;
        const timestamp = Date.now();
        
        // Value: JSON string of user request
        const payload = JSON.stringify({ userId, sessionType, timestamp });
        
        // ZADD allows sorted sets by timestamp (FIFO)
        await redis.zadd(queueKey, timestamp, payload);
        
        // Return position (0-indexed, so add 1)
        const rank = await redis.zrank(queueKey, payload);
        return (rank !== null ? rank + 1 : 1);
    }

    /**
     * Get position of user in waitlist
     */
    static async bypassQueue(astrologerId, userId, sessionType) {
        if (!redis) return 1;
        const queueKey = `astro:queue:${astrologerId}`;
        // Force timestamp to 0 so they sort to the very front instantly
        const overrideTimestamp = 0;
        const payload = JSON.stringify({ userId, sessionType, timestamp: overrideTimestamp, isBypassed: true });
        await redis.zadd(queueKey, overrideTimestamp, payload);
        return 1;
    }

    /**
     * Get position of user in waitlist
     */
    static async getUserPosition(astrologerId, userId) {
        if (!redis) return -1;
        const queueKey = `astro:queue:${astrologerId}`;
        
        // Get all members, find user
        // O(N) for small queues is fine. Redis doesn't support ZRANK by partial value matching natively.
        const members = await redis.zrange(queueKey, 0, -1);
        const index = members.findIndex(m => {
            try {
                return JSON.parse(m).userId === userId.toString();
            } catch (e) {
                return false;
            }
        });
        
        return index !== -1 ? index + 1 : -1;
    }

    /**
     * Get the next user in line (Popping)
     */
    static async dequeueNext(astrologerId) {
        if (!redis) return null;
        
        const queueKey = `astro:queue:${astrologerId}`;
        // Get lowest score (oldest)
        const results = await redis.zrange(queueKey, 0, 0);
        
        if (results && results.length > 0) {
            const nextPayload = results[0];
            await redis.zrem(queueKey, nextPayload);
            return JSON.parse(nextPayload);
        }
        return null;
    }

    static async removeFromWaitlist(astrologerId, userId) {
        if (!redis) return false;
        
        const queueKey = `astro:queue:${astrologerId}`;
        const members = await redis.zrange(queueKey, 0, -1);
        
        const memberToRemove = members.find(m => {
            try {
                return JSON.parse(m).userId === userId.toString();
            } catch (e) {
                return false;
            }
        });

        if (memberToRemove) {
            await redis.zrem(queueKey, memberToRemove);
            return true;
        }
        return false;
    }

    /**
     * Get full waitlist detail
     */
    static async getFullWaitlist(astrologerId) {
        if (!redis) return [];
        const queueKey = `astro:queue:${astrologerId}`;
        const members = await redis.zrange(queueKey, 0, -1);
        return members.map(m => JSON.parse(m));
    }
}

module.exports = QueueService;
