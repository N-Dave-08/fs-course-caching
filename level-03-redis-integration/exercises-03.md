# Exercises 03: Redis Integration

## Learning Objectives

By completing these exercises, you will:

- ✅ Create Redis client wrapper
- ✅ Build cache service
- ✅ Integrate Redis with Express
- ✅ Cache API responses
- ✅ Cache database queries
- ✅ Handle cache invalidation

## Before You Start

**Prerequisites:**

- Redis basics (Level 2)
- Express.js knowledge
- Understanding of caching patterns
- Redis running

**Setup:**

1. Navigate to `fs-course-caching/level-03-redis-integration/`
2. Install: `pnpm add redis`
3. Ensure Redis is running
4. Create these folders (if they don’t exist yet):
   - `src/`
   - `src/services/`
   - `src/middleware/`
   - `src/scripts/`
5. All exercises should be created in `src/`

---

## Exercise 1: Redis Client

**Objective:** Create Redis client wrapper.

**Instructions:**
Create `src/redis-client.ts`:

1. Singleton pattern
2. Connection management
3. Error handling

**Expected Code Structure:**

```typescript
// src/redis-client.ts
import { createClient } from "redis";

class RedisClient {
  private static instance: RedisClient;
  private client;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  getClient() {
    return this.client;
  }
}

export default RedisClient.getInstance();
```

**Verification:**

- Client connects
- Singleton works
- Error handling works

**File:** `src/redis-client.ts`

---

## Exercise 2: Cache Service

**Objective:** Create cache service.

**Instructions:**
Create `src/services/cache.service.ts`:

1. Get, set, delete methods
2. TTL support
3. JSON serialization

**Expected Code Structure:**

```typescript
// src/services/cache.service.ts
import redisClient from "../redis-client";

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.getClient().get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
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
      console.error("Cache set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    await redisClient.getClient().del(key);
  }
}

export default new CacheService();
```

**Verification:**

- Cache service works
- TTL works
- Serialization works

**File:** `src/services/cache.service.ts`

---

## Exercise 3: Integration

**Objective:** Integrate Redis with Express.

**Instructions:**
Create `src/middleware/cache.middleware.ts`:

1. Cache API responses
2. Cache database queries
3. Handle cache misses

**Expected Code Structure:**

```typescript
// src/middleware/cache.middleware.ts
import { Request, Response, NextFunction } from "express";
import cacheService from "../services/cache.service";

export function cacheMiddleware(ttlSeconds: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    // Try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to cache response
    res.json = function (body: any) {
      cacheService.set(cacheKey, body, ttlSeconds);
      return originalJson(body);
    };

    next();
  };
}
```

**Usage:**

```typescript
router.get("/users", cacheMiddleware(300), getUsers);
```

**Verification:**

- Caching works
- Cache hits return cached data
- Cache misses fetch fresh data

**File:** `src/middleware/cache.middleware.ts`

---

## Running Exercises

```bash
# Start Redis
redis-server

# Run a simple smoke test (create this file first)
npx ts-node src/scripts/verify-ex03.ts
```

### Smoke test file (required)

Create `src/scripts/verify-ex03.ts`:

```typescript
import redisClient from "../redis-client";
import cacheService from "../services/cache.service";

async function main() {
  await redisClient.connect();

  // Basic connectivity
  const pong = await redisClient.getClient().ping();
  console.log("PING:", pong);

  // Cache wrapper sanity check
  const key = "verify:ex03:v1";
  await cacheService.set(key, { ok: true, at: Date.now() }, 30);
  const value = await cacheService.get<{ ok: boolean; at: number }>(key);
  console.log("GET:", value);

  await cacheService.delete(key);
  const afterDelete = await cacheService.get(key);
  console.log("AFTER_DELETE:", afterDelete);

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

- [x] Redis client works
- [x] Cache service works
- [x] Middleware works
- [x] Caching improves performance
- [x] Error handling works

## Next Steps

1. ✅ **Review**: Understand Redis integration
2. ✅ **Experiment**: Add more caching
3. 📖 **Continue**: Move to [Level 4: Caching Strategies](../level-04-caching-strategies/lesson-01-cache-aside.md)
4. 💻 **Reference**: Check `project/` folder

---

**Key Takeaways:**

- Use singleton for Redis client
- Serialize data for storage
- Set appropriate TTL
- Handle cache misses
- Invalidate when needed
- Monitor cache performance

**Good luck! Happy coding! 🚀**
