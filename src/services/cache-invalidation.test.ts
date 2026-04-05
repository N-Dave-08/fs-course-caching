import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import redisClient from "../../src/redis-client";
import cacheInvalidation from "../../src/services/cache-invalidation";

describe("CacheInvalidation Service", () => {
  const client = redisClient.getClient();

  beforeAll(async () => {
    await redisClient.connect();
  }, 15000);

  afterAll(async () => {
    try {
      await redisClient.disconnect();
    } catch (err) {
      console.warn("[Redis Cleanup] Warning:", err);
    }
  }, 10000);

  beforeEach(async () => {
    // Fixed: pass keys as array
    await client.del([
      "test:user:1",
      "test:movie:1",
      "test:movie:2",
      "test:movie:101",
      "test:other:1",
    ]);

    await client.del("tag:test-genre-sci-fi");
  });

  it("should invalidate a specific key", async () => {
    const key = "test:user:1";
    await client.set(key, "data");

    await cacheInvalidation.invalidate(key);

    const result = await client.get(key);
    expect(result).toBeNull();
  });

  it("should invalidate keys by pattern using SCAN", async () => {
    await client.set("test:movie:1", "data1");
    await client.set("test:movie:2", "data2");
    await client.set("test:other:1", "keep-me");

    await cacheInvalidation.invalidatePattern("test:movie:*");

    expect(await client.exists("test:movie:1")).toBe(0);
    expect(await client.exists("test:movie:2")).toBe(0);
    expect(await client.exists("test:other:1")).toBe(1);
  });

  it("should add a tag to a key and invalidate by that tag", async () => {
    const movieKey = "test:movie:101";
    const tag = "test-genre-sci-fi";

    await client.set(movieKey, "Interstellar");
    await cacheInvalidation.addTag(movieKey, tag);

    const members = await client.sMembers(`tag:${tag}`);
    expect(members).toContain(movieKey);

    await cacheInvalidation.invalidateByTag(tag);

    expect(await client.exists(movieKey)).toBe(0);
    expect(await client.exists(`tag:${tag}`)).toBe(0);
  });
});
