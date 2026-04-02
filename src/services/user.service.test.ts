import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import userService from "./user.service";
import cacheService from "./cache.service";
import { fakeUserRepo } from "../db/fake-user-repo";
import redisClient from "../redis-client";

describe("UserService Caching Logic", () => {
  beforeAll(async () => {
    await redisClient.connect();
  });

  afterAll(async () => {
    // Correctly calling our Singleton's disconnect method
    await redisClient.disconnect();
  });

  beforeEach(async () => {
    // Clear known keys to ensure test isolation
    await cacheService.delete("user:1");
    await cacheService.delete("user:3"); // For the new user test
    vi.restoreAllMocks();
  });

  it("should only call the database once for multiple GET requests (Cache-Aside)", async () => {
    const spy = vi.spyOn(fakeUserRepo, "findById");

    // First call (Miss)
    const user1 = await userService.getUserById(1);
    expect(user1?.name).toBe("Alice");
    expect(spy).toHaveBeenCalledTimes(1);

    // Second call (Hit)
    const user2 = await userService.getUserById(1);
    expect(user2?.name).toBe("Alice");
    expect(spy).toHaveBeenCalledTimes(1); // Still 1
  });

  it("should pre-warm the cache when a new user is created", async () => {
    const newUser = { name: "Charlie", email: "charlie@example.com" };

    // 1. Create the user
    const created = await userService.createUser(newUser);
    const spy = vi.spyOn(fakeUserRepo, "findById");

    // 2. Try to get the user immediately
    // This should be a CACHE HIT because createUser "warmed" the cache
    const fetched = await userService.getUserById(created.id);

    expect(fetched?.name).toBe("Charlie");
    expect(spy).toHaveBeenCalledTimes(0); // DB was never touched
  });

  it("should update the cache when a user is updated (Write-Through)", async () => {
    // 1. Initial fetch to put Alice in cache
    await userService.getUserById(1);

    // 2. Update Alice's name
    await userService.updateUser(1, { name: "Alice 2.0" });

    // 3. Spy on the repo findById
    const spy = vi.spyOn(fakeUserRepo, "findById");

    // 4. Fetch Alice again
    const updatedUser = await userService.getUserById(1);

    expect(updatedUser?.name).toBe("Alice 2.0");
    expect(spy).toHaveBeenCalledTimes(0); // Should hit the updated cache, not DB
  });

  it("should return null and not cache if updating a non-existent user", async () => {
    const result = await userService.updateUser(999, { name: "Ghost" });
    expect(result).toBeNull();

    const cacheCheck = await cacheService.get("user:999");
    expect(cacheCheck).toBeNull();
  });
});
