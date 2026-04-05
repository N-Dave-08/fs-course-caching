// src/services/cache-invalidation.ts
import redisClient from "../redis-client";

class CacheInvalidation {
  // Invalidate specific key
  async invalidate(key: string): Promise<void> {
    await redisClient.getClient().del(key);
  }

  // Invalidate by pattern using SCAN (Correct for node-redis)
  async invalidatePattern(pattern: string): Promise<void> {
    const keys: string[] = [];

    // scanIterator yields arrays of keys (batches)
    for await (const batch of redisClient.getClient().scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      for (const rawKey of batch) {
        const keyStr = Buffer.isBuffer(rawKey)
          ? rawKey.toString()
          : String(rawKey);
        keys.push(keyStr);
      }
    }

    if (keys.length > 0) {
      await redisClient.getClient().del(keys); // Pass array directly
    }
  }

  // Tag-based invalidation
  async addTag(key: string, tag: string): Promise<void> {
    await redisClient.getClient().sAdd(`tag:${tag}`, key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = await redisClient.getClient().sMembers(`tag:${tag}`);

    if (keys.length > 0) {
      await redisClient.getClient().del(keys);
      await redisClient.getClient().del(`tag:${tag}`);
    }
  }
}

export default new CacheInvalidation();
