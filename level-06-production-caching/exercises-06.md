# Exercises 06: Production Caching

## Learning Objectives

By completing these exercises, you will:

- ✅ Monitor cache performance
- ✅ Optimize cache operations
- ✅ Implement production patterns
- ✅ Prevent cache stampede
- ✅ Use multi-level caching
- ✅ Handle cache failures gracefully

## Before You Start

**Prerequisites:**

- Advanced caching (Level 5)
- Production deployment knowledge
- Monitoring concepts
- Performance optimization

**Setup:**

1. Navigate to `fs-course-caching/level-06-production-caching/`
2. Ensure Redis is running
3. Create these folders (if they don’t exist yet):
   - `src/`
   - `src/monitoring/`
   - `src/optimization/`
   - `src/patterns/`
   - `src/scripts/`
4. All exercises should be created in `src/`

---

## Exercise 1: Monitoring

**Objective:** Implement cache monitoring.

**Instructions:**
Create `src/monitoring/cache-monitor.ts`:

1. Track hit/miss rates
2. Monitor memory usage
3. Log performance metrics

**Expected Code Structure:**

```typescript
// src/monitoring/cache-monitor.ts
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
      memoryUsage: 0, // Get from Redis INFO command
    };
  }

  async getMemoryUsage(): Promise<number> {
    const info = await redisClient.getClient().info("memory");
    // INFO returns a string. Example line: "used_memory:12345"
    const match = info.match(/^used_memory:(\d+)$/m);
    return match ? Number(match[1]) : 0;
  }
}

export default new CacheMonitor();
```

**Verification:**

- Monitoring works
- Stats tracked correctly
- Metrics logged

**File:** `src/monitoring/cache-monitor.ts`

---

## Exercise 2: Optimization

**Objective:** Optimize cache performance.

**Instructions:**
Create `src/optimization/cache-optimizer.ts`:

1. Use pipelines
2. Implement compression
3. Optimize key naming

**Expected Code Structure:**

```typescript
// src/optimization/cache-optimizer.ts
import redisClient from "../redis-client";

class CacheOptimizer {
  // Use pipelines for multiple operations
  async batchSet(items: Array<{ key: string; value: any }>): Promise<void> {
    const pipeline = redisClient.getClient().multi();

    for (const item of items) {
      pipeline.set(item.key, JSON.stringify(item.value));
    }

    await pipeline.exec();
  }

  // Optimize key naming
  normalizeKey(prefix: string, id: string): string {
    return `${prefix}:${id}`.toLowerCase();
  }
}

export default new CacheOptimizer();
```

**Verification:**

- Pipelines work
- Performance improved
- Keys optimized

**File:** `src/optimization/cache-optimizer.ts`

---

## Exercise 3: Production Patterns

**Objective:** Implement production patterns.

**Instructions:**
Create `src/patterns/production-patterns.ts`:

1. Cache stampede prevention
2. Multi-level caching
3. Fallback strategies

**Expected Code Structure:**

```typescript
// src/patterns/production-patterns.ts
import cacheService from "../services/cache.service";
import redisClient from "../redis-client";

type User = { id: number; name: string; email: string };
const users = new Map<number, User>([
  [1, { id: 1, name: "Alice", email: "alice@example.com" }],
]);

class ProductionPatterns {
  // Prevent cache stampede with locks
  async getUserWithLock(id: number) {
    const cacheKey = `user:${id}`;
    const lockKey = `lock:${cacheKey}`;

    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // Try to acquire lock
    const lockResult = await redisClient
      .getClient()
      .set(lockKey, "1", { NX: true, EX: 5 });
    if (lockResult !== "OK") {
      // Another process is fetching, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getUserWithLock(id);
    }

    try {
      // Fetch from database
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
```

**Verification:**

- Patterns work
- Stampede prevented
- Fallbacks work

**File:** `src/patterns/production-patterns.ts`

---

## Running Exercises

```bash
# Create this file first (recommended)
npx ts-node src/scripts/verify-ex06.ts
```

### Smoke test file (recommended)

Create `src/scripts/verify-ex06.ts`:

```typescript
import redisClient from "../redis-client";

async function main() {
  await redisClient.connect();

  // Basic diagnostics
  const memoryInfo = await redisClient.getClient().info("memory");
  const usedMemoryLine = memoryInfo
    .split("\n")
    .find((l) => l.startsWith("used_memory:"));
  console.log("memory_used_line:", usedMemoryLine?.trim());

  // Pipeline sanity check
  const pipeline = redisClient.getClient().multi();
  pipeline.set("batch:a", "1");
  pipeline.set("batch:b", "2");
  await pipeline.exec();
  console.log("pipeline_ok");

  await redisClient.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await redisClient.disconnect();
  } catch {}
  process.exitCode = 1;
});
```

## Verification Checklist

- [x] Monitoring works
- [x] Optimization works
- [x] Production patterns work
- [x] Performance improved
- [x] Failures handled

## Next Steps

1. ✅ **Review**: Understand production caching
2. ✅ **Experiment**: Add more optimizations
3. 📖 **Complete**: Review all caching levels
4. 💻 **Reference**: Check `project/` folder

---

**Key Takeaways:**

- Monitor cache performance
- Optimize operations
- Prevent cache stampede
- Use multi-level caching
- Handle failures gracefully
- Balance performance and consistency

**Good luck! Happy coding! 🚀**
