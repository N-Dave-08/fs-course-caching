import redisClient from "../redis-client";

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
}

class CacheMonitor {
  private hits = 0;
  private misses = 0;

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
      memoryUsage: 0,
    };
  }

  async getMemoryUsage(): Promise<number> {
    const info = await redisClient.getClient().info("memory");

    const match = info.match(/^used_memory:(\d+)$/m);
    return match ? Number(match[1]) : 0;
  }
}

export default new CacheMonitor();
