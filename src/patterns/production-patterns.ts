import redisClient from "../redis-client";
import cacheService from "../services/cache.service";

type User = { id: number; name: string; email: string };
const users = new Map<number, User>([
  [1, { id: 1, name: "Alice", email: "alice@example.com" }],
]);

class ProductionPatterns {
  async getUserWithLock(id: number): Promise<User | null> {
    const cacheKey = `user:${id}`;
    const lockKey = `lock:${cacheKey}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) return cached as User;

    const lockResult = await redisClient
      .getClient()
      .set(lockKey, "1", { NX: true, EX: 5 });
    if (lockResult !== "OK") {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getUserWithLock(id);
    }

    try {
      const user = users.get(id) ?? null;
      if (user) {
        await cacheService.set(cacheKey, user, 300);
      }
      return user;
    } finally {
      await cacheService.delete(lockKey);
    }
  }
}

export default new ProductionPatterns();
