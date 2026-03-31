# Exercises 02: Redis Basics

## Learning Objectives

By completing these exercises, you will:

- ✅ Use Redis string operations
- ✅ Work with Redis hashes
- ✅ Use different Redis data structures
- ✅ Understand Redis commands
- ✅ Practice Redis patterns
- ✅ Integrate Redis with Node.js

## Before You Start

**Prerequisites:**

- Redis installed and running
- Basic Redis command understanding (Level 2 lessons)
- Understanding of caching concepts
- Node.js and TypeScript set up

**Setup:**

1. Navigate to `fs-course-caching/level-02-redis-basics/`
2. Ensure Redis is running: `redis-cli ping` (should return PONG)
3. Install the Node Redis client (so you can run the TypeScript exercises): `pnpm add redis`
4. Create `exercises/` directory

---

## Exercise 1: String Operations

**Objective:** Practice basic Redis string commands.

**Instructions:**
Create `exercises/exercise-01.ts` that demonstrates:

1. SET, GET, DEL operations
2. SETEX (set with expiration)
3. INCR, DECR operations

**Expected Code Structure:**

```typescript
// exercises/exercise-01.ts
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function main() {
  await client.connect();

  // SET and GET
  await client.set("user:1:name", "Alice");
  const name = await client.get("user:1:name");
  console.log("User name:", name); // "Alice"

  // SETEX - set with expiration (TTL in seconds)
  await client.setEx("session:abc123", 3600, "session-data"); // Expires in 1 hour
  const session = await client.get("session:abc123");
  console.log("Session:", session);

  // Check TTL
  const ttl = await client.ttl("session:abc123");
  console.log("Session TTL:", ttl, "seconds");

  // INCR - increment number
  await client.set("counter", "0");
  const count1 = await client.incr("counter");
  const count2 = await client.incr("counter");
  console.log("Counter after increments:", count2); // 2

  // DECR - decrement number
  const count3 = await client.decr("counter");
  console.log("Counter after decrement:", count3); // 1

  // GET current value
  const currentCount = await client.get("counter");
  console.log("Current counter value:", currentCount); // "1"

  // DEL - delete key
  await client.del("user:1:name");
  const deleted = await client.get("user:1:name");
  console.log("After delete:", deleted); // null

  await client.quit();
}

main().catch(console.error);
```

**Verification Steps:**

1. Run script: `npx ts-node exercises/exercise-01.ts`
2. Check Redis: `redis-cli GET user:1:name`
3. Verify TTL: `redis-cli TTL session:abc123`

**Expected Behavior:**

- SET/GET work correctly
- SETEX sets expiration
- INCR/DECR increment/decrement
- DEL removes keys

**Hints:**

- Use `await` for all Redis operations
- Connect before operations
- Quit when done
- Handle errors

**Common Mistakes:**

- ❌ Not connecting to Redis
- ❌ Not awaiting async operations
- ❌ Forgetting to quit connection

**File:** `exercises/exercise-01.ts`

---

## Exercise 2: Hash Operations

**Objective:** Use Redis hashes for structured data.

**Instructions:**
Create `exercises/exercise-02.ts` that:

1. Stores user data as hash
2. Retrieves specific fields
3. Gets all fields

**Expected Code Structure:**

```typescript
// exercises/exercise-02.ts
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function main() {
  await client.connect();

  const userId = "user:1";

  // HSET - set hash fields
  await client.hSet(userId, {
    name: "Alice",
    email: "alice@example.com",
    age: "25",
    role: "admin",
  });

  // HGET - get single field
  const name = await client.hGet(userId, "name");
  console.log("User name:", name); // "Alice"

  // HGETALL - get all fields
  const user = await client.hGetAll(userId);
  console.log("Full user:", user);
  // { name: 'Alice', email: 'alice@example.com', age: '25', role: 'admin' }

  // HGET multiple fields
  const emailAndRole = await client.hmGet(userId, ["email", "role"]);
  console.log("Email and role:", emailAndRole);

  // HINCRBY - increment numeric field
  await client.hIncrBy(userId, "age", 1);
  const newAge = await client.hGet(userId, "age");
  console.log("Updated age:", newAge); // "26"

  // HDEL - delete field
  await client.hDel(userId, "role");
  const userAfterDelete = await client.hGetAll(userId);
  console.log("User after deleting role:", userAfterDelete);

  // HEXISTS - check if field exists
  const hasEmail = await client.hExists(userId, "email");
  console.log("Has email field:", hasEmail); // true

  await client.quit();
}

main().catch(console.error);
```

**Verification:**

- Hash operations work
- Can get individual fields
- Can get all fields
- Field operations work

**Hints:**

- Hashes store object-like data
- All values are strings (convert numbers)
- Use for structured data
- More efficient than JSON strings

**File:** `exercises/exercise-02.ts`

---

## Exercise 3: Data Structures

**Objective:** Use different Redis data structures.

**Instructions:**
Create `exercises/exercise-03.ts` that demonstrates:

1. Lists (ordered collection)
2. Sets (unique collection)
3. Sorted Sets (ordered with scores)

**Expected Code Structure:**

```typescript
// exercises/exercise-03.ts
import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function main() {
  await client.connect();

  // 1. LISTS - Ordered collection
  console.log("=== LISTS ===");
  await client.lPush("tasks", "task1", "task2", "task3");
  const tasks = await client.lRange("tasks", 0, -1); // Get all
  console.log("All tasks:", tasks); // ['task3', 'task2', 'task1']

  await client.rPush("tasks", "task4"); // Add to end
  const allTasks = await client.lRange("tasks", 0, -1);
  console.log("Tasks after rPush:", allTasks);

  const firstTask = await client.lPop("tasks"); // Remove from start
  console.log("Popped task:", firstTask);

  // 2. SETS - Unique collection
  console.log("\n=== SETS ===");
  await client.sAdd("tags", "javascript", "typescript", "nodejs");
  const tags = await client.sMembers("tags");
  console.log("All tags:", tags);

  await client.sAdd("tags", "javascript"); // Duplicate ignored
  const tagsAfter = await client.sMembers("tags");
  console.log("Tags after duplicate:", tagsAfter); // Same as before

  const hasTag = await client.sIsMember("tags", "typescript");
  console.log("Has typescript tag:", hasTag); // true

  // 3. SORTED SETS - Ordered with scores (leaderboard)
  console.log("\n=== SORTED SETS ===");
  await client.zAdd("leaderboard", [
    { score: 100, value: "Alice" },
    { score: 200, value: "Bob" },
    { score: 150, value: "Charlie" },
  ]);

  // Get top 3 (highest scores)
  const topPlayers = await client.zRangeWithScores("leaderboard", 0, 2, {
    REV: true, // Reverse order (highest first)
  });
  console.log("Top 3 players:", topPlayers);

  // Get rank of player
  const rank = await client.zRank("leaderboard", "Bob");
  console.log("Bob rank:", rank);

  // Increment score
  await client.zIncrBy("leaderboard", 50, "Alice");
  const updatedTop = await client.zRangeWithScores("leaderboard", 0, -1, {
    REV: true,
  });
  console.log("Updated leaderboard:", updatedTop);

  await client.quit();
}

main().catch(console.error);
```

**Verification:**

- Lists maintain order
- Sets ensure uniqueness
- Sorted sets order by score
- All operations work

**Hints:**

- Lists: LPUSH/RPUSH, LPOP/RPOP, LRANGE
- Sets: SADD, SMEMBERS, SISMEMBER
- Sorted Sets: ZADD, ZRANGE, ZINCRBY
- Choose structure based on use case

**File:** `exercises/exercise-03.ts`

---

## Running Exercises

### Start Redis

```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Run Exercises

```bash
npx ts-node exercises/exercise-01.ts
npx ts-node exercises/exercise-02.ts
npx ts-node exercises/exercise-03.ts
```

### Test with Redis CLI

```bash
redis-cli
> GET user:1:name
> HGETALL user:1
> SMEMBERS tags
> ZRANGE leaderboard 0 -1 WITHSCORES
```

## Verification Checklist

After completing all exercises, verify:

- [x] String operations work
- [x] Hash operations work
- [x] List operations work
- [x] Set operations work
- [x] Sorted set operations work
- [x] TTL/expiration works
- [x] All data structures function correctly

## Troubleshooting

### Issue: "Redis connection refused"

**Solution:**

- Start Redis: `redis-server`
- Check Redis is running: `redis-cli ping`
- Verify connection URL

### Issue: "Client is closed"

**Solution:**

- Call `client.connect()` before operations
- Don't call `quit()` too early
- Handle connection errors

### Issue: Type errors

**Solution:**

- Install types: `pnpm add -D @types/redis`
- Check Redis client version
- Verify TypeScript config

## Next Steps

1. ✅ **Review**: Understand Redis data structures
2. ✅ **Experiment**: Create more complex patterns
3. 📖 **Continue**: Move to [Level 3: Redis Integration](../level-03-redis-integration/lesson-01-node-redis-setup.md)
4. 💻 **Reference**: Check `project/` folder

---

**Key Takeaways:**

- Strings: Simple key-value storage
- Hashes: Structured object data
- Lists: Ordered collections
- Sets: Unique collections
- Sorted Sets: Ordered by score
- Choose structure based on use case
- Redis is fast in-memory storage

**Good luck! Happy coding! 🚀**
