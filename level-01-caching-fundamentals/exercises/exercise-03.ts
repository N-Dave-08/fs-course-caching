{
  interface CacheStats {
    hits: number;
    misses: number;
    get hitRate(): number;
  }

  class CacheWithStats {
    private cache: Map<string, any> = new Map();
    private stats: CacheStats = {
      hits: 0,
      misses: 0,
      get hitRate(): number {
        const total = this.hits + this.misses;
        if (total === 0) return 0;
        return (this.hits / total) * 100;
      },
    };

    set(key: string, value: any): void {
      this.cache.set(key, value);
    }
    get(key: string): any {
      if (this.cache.has(key)) {
        this.stats.hits++;
        return this.cache.get(key);
      } else {
        this.stats.misses++;
        return undefined;
      }
    }

    // get cache stats
    getStats(): CacheStats {
      return { ...this.stats };
    }

    // reset stats
    resetStats(): void {
      this.stats.hits = 0;
      this.stats.misses = 0;
    }

    // get hit rate as percentage
    getHitRate(): number {
      return this.stats.hitRate;
    }
  }

  const cache = new CacheWithStats();

  //   populate cache
  cache.set("key1", "value1");
  cache.set("key2", "value2");

  //   generate some this and misses
  cache.get("key1"); // hit
  cache.get("key2"); // hit
  cache.get("key3"); // miss
  cache.get("key1"); // hit
  cache.get("key4"); // miss

  //   check stats
  const stats = cache.getStats();
  console.log("cache stats");
  console.log(`Hits ${stats.hits}`);
  console.log(`Misses ${stats.misses}`);
  console.log(`Hit Rate: ${cache.getHitRate().toFixed(2)}%`);
}
