{
  interface CacheEnter<T> {
    value: T;
    expiresAt: number;
  }

  class CacheWithTTL {
    private cache: Map<string, CacheEnter<any>> = new Map();

    /**
     * Set a value with TTL
     * @param key - Cache key
     * @param value Value to store
     * @param ttlMs Time to live in milliseconds
     */
    set<T>(key: string, value: T, ttlMs: number): void {
      const expiresAt = Date.now() + ttlMs;
      this.cache.set(key, { value, expiresAt });
    }

    get<T>(key: string): T | undefined {
      const entry = this.cache.get(key);

      if (!entry) {
        return undefined; // key does not exist
      }

      // Check of expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key); // Remove expired entry
        return undefined;
      }

      return entry.value as T;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
      const entry = this.cache.get(key);
      if (!entry) return false;

      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return false;
      }

      return false;
    }

    /**
     * Delete a key
     */
    delete(key: string): boolean {
      return this.cache.delete(key);
    }
  }

  // test TTL Cache
  const cache = new CacheWithTTL();

  //   set with 1 second TTL
  cache.set("temp: 1", "This expires in 1 second", 1000);
  console.log("Immediately: ", cache.get("temp: 1")); // should return a value

  //   Wait and check (in real scenario, use setTimeout)
  setTimeout(() => {
    console.log("After 1.5 seconds: ", cache.get("temp: 1")); // should be undefined
  }, 1500);

  //   set with longer TTL
  const longerTTLKey = "user:1";
  const totalSeconds = 6;

  cache.set(longerTTLKey, { name: "Alice" }, totalSeconds * 1000);
  console.log("User with 5s TTL: ", cache.get(longerTTLKey));

  //   test 5 seconds TTL
  console.log("--- Starting 5-Second TTL Test ---");

  let secondsLeft = totalSeconds - 1;

  //   check every second
  const interval = setInterval(() => {
    const data = cache.get(longerTTLKey);
    if (data && secondsLeft > 0) {
      console.log(
        `${secondsLeft}, Data is still there... ${JSON.stringify(data)}`,
      );
      secondsLeft--;
    } else {
      console.log(
        `0! Cache expired successfully ${JSON.stringify(data) ? "still there" : "expired"}`,
      );
      clearInterval(interval);
    }
  }, 1000);
}
