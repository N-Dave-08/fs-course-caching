import userService from "../../src/services/user.service";
import redisClient from "../../src/redis-client";

// Note: In modern Node.js, 'performance' is global.
// If your linter complains, uncomment the line below:
// import { performance } from "perf_hooks";

async function compareStrategies() {
  try {
    // 1. Initialize Connection
    await redisClient.connect();

    // Clear cache for User 1 to ensure Strategy 1 starts with a "Miss"
    await redisClient.getClient().del("user:1");

    console.log("--- Starting Strategy Comparison ---\n");

    // --- STRATEGY 1: CACHE-ASIDE (Lazy Loading) ---
    // Logic: Request data -> Miss -> Fetch from DB -> Cache it -> Request again -> Hit
    console.log("Running Cache-Aside Test...");
    const start1 = performance.now();

    await userService.getUserById(1); // First call: MISS (~50ms sleep in repo)
    await userService.getUserById(1); // Second call: HIT (~1ms from Redis)

    const end1 = performance.now();
    const totalAside = (end1 - start1).toFixed(2);
    console.log(`Cache-aside total time: ${totalAside}ms\n`);

    // --- STRATEGY 2: WRITE-THROUGH (Eager Loading) ---
    // Logic: Create data (Writes to DB & Cache) -> Request data -> Hit immediately
    console.log("Running Write-Through Test...");
    const start2 = performance.now();

    // FIX: We capture the user object to get the generated ID
    const newUser = await userService.createUser({
      name: "Benchmark User",
      email: "test@example.com",
    });

    // FIX: Use newUser.id instead of the undefined 'newUserId'
    await userService.getUserById(newUser.id); // This is a HIT (0ms delay)

    const end2 = performance.now();
    const totalWriteThrough = (end2 - start2).toFixed(2);
    console.log(`Write-through total time: ${totalWriteThrough}ms\n`);

    // --- SUMMARY ---
    console.log("--- Final Results ---");
    console.log(`Cache-Aside:   ${totalAside}ms`);
    console.log(`Write-Through: ${totalWriteThrough}ms`);
  } catch (error) {
    console.error("Benchmark failed:", error);
  } finally {
    // 2. Close Connection
    await redisClient.disconnect();
  }
}

compareStrategies();
