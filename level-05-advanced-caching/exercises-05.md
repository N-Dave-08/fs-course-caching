# Exercises 05: Advanced Caching

## Learning Objectives

By completing these exercises, you will:
- ✅ Implement cache invalidation strategies
- ✅ Use different TTL strategies
- ✅ Implement cache warming
- ✅ Handle cache consistency
- ✅ Optimize cache performance
- ✅ Practice advanced caching patterns

## Before You Start

**Prerequisites:**
- Caching strategies (Level 4)
- Redis advanced knowledge
- Understanding of cache patterns
- Express.js knowledge

**Setup:**
1. Navigate to `fs-course-caching/level-05-advanced-caching/`
2. Ensure Redis is running
3. Create these folders (if they don’t exist yet):
   - `src/`
   - `src/services/`
   - `src/db/`
   - `src/scripts/`
4. All exercises should be created in `src/`

---

## Exercise 1: Cache Invalidation

**Objective:** Implement cache invalidation.

**Instructions:**
Create `src/services/cache-invalidation.ts`:
1. Event-based invalidation
2. Pattern-based invalidation
3. Tag-based invalidation

**Expected Code Structure:**
```typescript
// src/services/cache-invalidation.ts
import redisClient from '../redis-client';

class CacheInvalidation {
  // Invalidate specific key
  async invalidate(key: string): Promise<void> {
    await redisClient.getClient().del(key);
  }

  // Invalidate by pattern (use SCAN, avoid KEYS in production)
  async invalidatePattern(pattern: string): Promise<void> {
    const keys: string[] = [];

    for await (const key of redisClient.getClient().scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.getClient().del(...keys);
    }
  }

  // Tag-based invalidation
  async addTag(key: string, tag: string): Promise<void> {
    await redisClient.getClient().sAdd(`tag:${tag}`, key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = await redisClient.getClient().sMembers(`tag:${tag}`);
    if (keys.length > 0) {
      await redisClient.getClient().del(...keys);
      await redisClient.getClient().del(`tag:${tag}`);
    }
  }
}

export default new CacheInvalidation();
```

**Verification:**
- Invalidation works
- Patterns work
- Tags work

**File:** `src/services/cache-invalidation.ts`

---

## Exercise 2: TTL Strategies

**Objective:** Implement different TTL strategies.

**Instructions:**
Create `src/services/ttl-strategies.ts`:
1. Fixed TTL
2. Sliding TTL
3. Adaptive TTL

**Expected Code Structure:**
```typescript
// src/services/ttl-strategies.ts
import cacheService from './cache.service';
import redisClient from '../redis-client';

class TTLStrategies {
  // Fixed TTL - same expiration for all
  async setWithFixedTTL(key: string, value: any, ttl: number): Promise<void> {
    await cacheService.set(key, value, ttl);
  }

  // Sliding TTL - extends on access
  async getWithSlidingTTL(key: string, ttl: number): Promise<any> {
    const value = await cacheService.get(key);
    if (value) {
      // Extend TTL on access
      await redisClient.getClient().expire(key, ttl);
    }
    return value;
  }

  // Adaptive TTL - adjusts based on access frequency
  async setWithAdaptiveTTL(key: string, value: any, baseTTL: number): Promise<void> {
    const count = await redisClient.getClient().incr(`access:${key}`);
    
    // More accesses = longer TTL
    const adaptiveTTL = Math.ceil(baseTTL * (1 + Math.min(count / 10, 2)));
    await cacheService.set(key, value, adaptiveTTL);
  }
}

export default new TTLStrategies();
```

**Verification:**
- TTL strategies work
- Sliding TTL extends correctly
- Adaptive TTL adjusts

**File:** `src/services/ttl-strategies.ts`

---

## Exercise 3: Cache Warming

**Objective:** Implement cache warming.

**Instructions:**
Create `src/services/cache-warming.ts`:
1. Warm on startup
2. Scheduled warming
3. Selective warming

**Expected Code Structure:**
```typescript
// src/services/cache-warming.ts
import cacheService from './cache.service';

type User = { id: number; name: string; email: string };

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Cleo", email: "cleo@example.com" },
];

class CacheWarming {
  // Warm cache on startup
  async warmOnStartup(): Promise<void> {
    for (const user of users.slice(0, 100)) {
      await cacheService.set(`user:${user.id}`, user, 3600);
    }
  }

  // Scheduled warming
  async scheduledWarm(): Promise<void> {
    // Warm frequently accessed data
    for (const user of users.slice(0, 50)) {
      await cacheService.set(`user:${user.id}`, user, 3600);
    }
  }

  // Selective warming
  async warmUser(userId: number): Promise<void> {
    const user = users.find((u) => u.id === userId);

    if (user) {
      await cacheService.set(`user:${userId}`, user, 3600);
    }
  }
}

export default new CacheWarming();
```

**Verification:**
- Warming works
- Scheduled warming works
- Selective warming works

**File:** `src/services/cache-warming.ts`

---

## Running Exercises

```bash
# Create this file first (recommended)
npx ts-node src/scripts/verify-ex05.ts
```

### Smoke test file (recommended)

Create `src/scripts/verify-ex05.ts`:

```typescript
import redisClient from "../redis-client";
import cacheInvalidation from "../services/cache-invalidation";
import ttlStrategies from "../services/ttl-strategies";
import cacheWarming from "../services/cache-warming";

async function main() {
  await redisClient.connect();

  // Tags + invalidation
  await redisClient.getClient().set("user:1", JSON.stringify({ id: 1 }));
  await cacheInvalidation.addTag("user:1", "users");
  await cacheInvalidation.invalidateByTag("users");
  console.log("invalidated_by_tag_ok");

  // TTL strategies
  await ttlStrategies.setWithFixedTTL("ttl:fixed", { ok: true }, 30);
  await ttlStrategies.getWithSlidingTTL("ttl:fixed", 30);
  await ttlStrategies.setWithAdaptiveTTL("ttl:adaptive", { ok: true }, 10);
  console.log("ttl_strategies_ok");

  // Warming
  await cacheWarming.warmOnStartup();
  const warmed = await redisClient.getClient().get("user:1");
  console.log("warmed_user_1:", warmed);

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

- [ ] Invalidation works
- [ ] TTL strategies work
- [ ] Cache warming works
- [ ] All patterns work correctly
- [ ] Performance improved

## Next Steps

1. ✅ **Review**: Understand advanced caching
2. ✅ **Experiment**: Add more patterns
3. 📖 **Continue**: Move to [Level 6: Production Caching](../level-06-production-caching/lesson-01-cache-monitoring.md)
4. 💻 **Reference**: Check `project/` folder

---

**Key Takeaways:**
- Invalidate stale data
- Use appropriate TTL strategies
- Warm cache for performance
- Monitor cache effectiveness
- Balance freshness and performance
- Handle invalidation carefully

**Good luck! Happy coding! 🚀**
