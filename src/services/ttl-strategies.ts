import cacheService from "./cache.service";
import redisClient from "../redis-client";

class TTLStrategies {
  async setWithFixedTTL(key: string, value: any, ttl: number): Promise<void> {
    await cacheService.set(key, value, ttl);
  }

  async getWithSlidingTTL(key: string, ttl: number): Promise<any> {
    const value = await cacheService.get(key);
    if (value) {
      await redisClient.getClient().expire(key, ttl);
    }
    return value;
  }

  async setWithAdaptiveTTL(
    key: string,
    value: any,
    baseTTL: number,
  ): Promise<void> {
    const count = await redisClient.getClient().incr(`access:${key}`);

    const adaptiveTTL = Math.ceil(baseTTL * (1 + Math.min(count / 10, 2)));
    await cacheService.set(key, value, adaptiveTTL);
  }
}

export default new TTLStrategies();
