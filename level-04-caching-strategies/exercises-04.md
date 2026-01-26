# Exercises 04: Caching Strategies

## Learning Objectives

By completing these exercises, you will:
- ✅ Implement cache-aside pattern
- ✅ Implement write-through pattern
- ✅ Compare caching strategies
- ✅ Understand trade-offs
- ✅ Choose appropriate strategy
- ✅ Handle cache failures

## Before You Start

**Prerequisites:**
- Redis integration (Level 3)
- Understanding of caching patterns
- Database knowledge
- Express.js knowledge

**Setup:**
1. Navigate to `fs-course-caching/level-04-caching-strategies/`
2. Ensure Redis is running
3. Create these folders (if they don’t exist yet):
   - `src/`
   - `src/services/`
   - `src/db/`
   - `src/scripts/`
4. All exercises should be created in `src/`

---

## Exercise 1: Cache-Aside

**Objective:** Implement cache-aside pattern.

**Instructions:**
Create `src/services/user.service.ts` with cache-aside:
1. Check cache first
2. Fetch from database on miss
3. Store in cache

**Expected Code Structure:**
```typescript
// src/services/user.service.ts
import cacheService from "./cache.service";
import { fakeUserRepo, type User } from "../db/fake-user-repo";

class UserService {
  async getUserById(id: number) {
    const cacheKey = `user:${id}`;
    
    // 1. Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached; // Cache hit
    }

    // 2. Cache miss - fetch from database
    const user = await fakeUserRepo.findById(id);

    if (user) {
      // 3. Store in cache
      await cacheService.set(cacheKey, user, 300); // 5 min TTL
    }

    return user;
  }
}

export default new UserService();
```

Create `src/db/fake-user-repo.ts`:

```typescript
export type User = { id: number; name: string; email: string };

const users = new Map<number, User>([
  [1, { id: 1, name: "Alice", email: "alice@example.com" }],
  [2, { id: 2, name: "Bob", email: "bob@example.com" }],
]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const fakeUserRepo = {
  async findById(id: number): Promise<User | null> {
    // Simulate DB latency so cache benefits are visible
    await sleep(50);
    return users.get(id) ?? null;
  },

  async create(data: Omit<User, "id">): Promise<User> {
    await sleep(50);
    const id = Math.max(0, ...users.keys()) + 1;
    const user: User = { id, ...data };
    users.set(id, user);
    return user;
  },

  async update(id: number, data: Partial<Omit<User, "id">>): Promise<User | null> {
    await sleep(50);
    const existing = users.get(id);
    if (!existing) return null;
    const updated: User = { ...existing, ...data };
    users.set(id, updated);
    return updated;
  },
};
```

**Verification:**
- Cache-aside works
- Cache hits return cached data
- Cache misses fetch from DB

**File:** `src/services/user.service.ts`

---

## Exercise 2: Write-Through

**Objective:** Implement write-through pattern.

**Instructions:**
Add write-through to user service:
1. Write to database
2. Write to cache
3. Ensure both succeed

**Expected Code Structure:**
```typescript
// Add to src/services/user.service.ts
async createUser(data: { name: string; email: string }) {
  // 1. Write to database (source of truth)
  const user = await fakeUserRepo.create(data);
  
  // 2. Write to cache
  const cacheKey = `user:${user.id}`;
  await cacheService.set(cacheKey, user, 300);
  
  return user;
}

async updateUser(id: number, data: Partial<User>) {
  // 1. Update database (source of truth)
  const user = await fakeUserRepo.update(id, data);
  if (!user) return null;
  
  // 2. Update cache
  const cacheKey = `user:${id}`;
  await cacheService.set(cacheKey, user, 300);
  
  return user;
}
```

**Verification:**
- Write-through works
- Database and cache stay in sync
- Both operations succeed

**File:** Update `src/services/user.service.ts`

---

## Exercise 3: Strategy Comparison

**Objective:** Compare caching strategies.

**Instructions:**
Create `exercises/strategy-comparison.ts`:
1. Measure performance
2. Test failure scenarios
3. Compare strategies

**Expected Code Structure:**
```typescript
// exercises/strategy-comparison.ts
import { performance } from 'perf_hooks';

async function compareStrategies() {
  // Test cache-aside
  const start1 = performance.now();
  await userService.getUserById(1); // First call - cache miss
  await userService.getUserById(1); // Second call - cache hit
  const end1 = performance.now();
  console.log('Cache-aside time:', end1 - start1);

  // Test write-through
  const start2 = performance.now();
  await userService.createUser({ name: 'Test', email: 'test@example.com' });
  await userService.getUserById(newUserId); // Should be cache hit
  const end2 = performance.now();
  console.log('Write-through time:', end2 - start2);
}
```

**Verification:**
- Strategies compared
- Performance measured
- Trade-offs understood

**File:** `exercises/strategy-comparison.ts`

---

## Running Exercises

```bash
# Create this file first (recommended)
npx ts-node src/scripts/verify-ex04.ts
```

### Smoke test file (recommended)

Create `src/scripts/verify-ex04.ts`:

```typescript
import { performance } from "perf_hooks";
import userService from "../services/user.service";

async function main() {
  const start1 = performance.now();
  await userService.getUserById(1); // miss
  await userService.getUserById(1); // hit
  const end1 = performance.now();
  console.log("cache_aside_two_reads_ms:", (end1 - start1).toFixed(1));

  const created = await userService.createUser({
    name: "Test",
    email: "test@example.com",
  });

  const start2 = performance.now();
  await userService.getUserById(created.id); // should be hit (write-through)
  const end2 = performance.now();
  console.log("write_through_read_ms:", (end2 - start2).toFixed(1));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

## Verification Checklist

- [ ] Cache-aside works
- [ ] Write-through works
- [ ] Strategies compared
- [ ] Performance measured
- [ ] Failure handling works

## Next Steps

1. ✅ **Review**: Understand caching strategies
2. ✅ **Experiment**: Implement more strategies
3. 📖 **Continue**: Move to [Level 5: Advanced Caching](../level-05-advanced-caching/lesson-01-cache-invalidation.md)
4. 💻 **Reference**: Check `project/` folder

---

**Key Takeaways:**
- Cache-aside: read from cache, write to DB
- Write-through: write to both cache and DB
- Choose strategy based on use case
- Handle cache failures gracefully
- Monitor cache performance
- Balance consistency and performance

**Good luck! Happy coding! 🚀**
