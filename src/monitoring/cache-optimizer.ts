import redisClient from "../redis-client";

class CacheOptimizer {
  async batchSet(items: Array<{ key: string; value: any }>): Promise<void> {
    const pipeline = redisClient.getClient().multi();

    for (const item of items) {
      pipeline.set(item.key, JSON.stringify(item.value));
    }

    await pipeline.exec();
  }

  normalizeKey(prefix: string, id: string): string {
    return `${prefix}:${id}`.toLowerCase();
  }
}

export default new CacheOptimizer();
