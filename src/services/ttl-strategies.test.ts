import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import redisClient from "../../src/redis-client";
import TTLStrategies from "./ttl-strategies";

describe("TTLStrategies Service", () => {
  const client = redisClient.getClient();

  beforeAll(async () => {
    await redisClient.connect();
  });

  afterAll(async () => {
    await redisClient.disconnect();
  });

  beforeEach(async () => {
    // Clean up test keys
    const keys = await client.keys("test:*");
    const accessKeys = await client.keys("access:test:*");
    if (keys.length > 0) await client.del(keys);
    if (accessKeys.length > 0) await client.del(accessKeys);
  });

  it("should set a value with a fixed TTL", async () => {
    const key = "test:fixed";
    const ttl = 10; // 10 seconds

    await TTLStrategies.setWithFixedTTL(key, { data: "fixed" }, ttl);

    const remainingTTL = await client.ttl(key);
    // TTL should be roughly our input (allowing 1s for execution delay)
    expect(remainingTTL).toBeGreaterThan(0);
    expect(remainingTTL).toBeLessThanOrEqual(ttl);
  });

  it("should slide the TTL forward on GET", async () => {
    const key = "test:sliding";
    const initialTTL = 10;
    const slideTo = 60;

    // Set initial data
    await client.set(key, JSON.stringify({ data: "slide" }), {
      EX: initialTTL,
    });

    // Call sliding GET
    await TTLStrategies.getWithSlidingTTL(key, slideTo);

    const newTTL = await client.ttl(key);
    // The TTL should now be close to 60, not 10
    expect(newTTL).toBeGreaterThan(initialTTL);
    expect(newTTL).toBeLessThanOrEqual(slideTo);
  });

  it("should increase TTL based on access frequency (Adaptive)", async () => {
    const key = "test:adaptive";
    const baseTTL = 100;

    // Simulate 5 prior accesses
    for (let i = 0; i < 5; i++) {
      await client.incr(`access:${key}`);
    }

    // This call will increment the count to 6
    await TTLStrategies.setWithAdaptiveTTL(key, { data: "popular" }, baseTTL);

    const actualTTL = await client.ttl(key);

    // Calculation: 100 * (1 + 0.6) = 160
    // We use a small range to account for execution time (158-160)
    expect(actualTTL).toBeGreaterThan(155);
    expect(actualTTL).toBeLessThanOrEqual(160);
  });
});
