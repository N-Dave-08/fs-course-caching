import redisClient from "../redis-client";

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.getClient().get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error: ", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.getClient().setEx(key, ttlSeconds, serialized);
      } else {
        await redisClient.getClient().set(key, serialized);
      }
    } catch (error) {
      console.error("Cache set error: ", error);
    }
  }

  async delete(key: string): Promise<void> {
    await redisClient.getClient().del(key);
  }
}

export default new CacheService();
