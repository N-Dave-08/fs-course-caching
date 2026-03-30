class SimpleCache {
  private cache: Map<string, any> = new Map();

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to store
   */
  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  get(key: string): any {
    return this.cache.get(key);
  }

  /**
   * Check if key exists in the cache
   * @param key Cache key
   * @returns True if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   * @param key - Cache key
   * @returns True if key was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   *
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// test
const cache = new SimpleCache();

// set values
cache.set("user: 1", { id: 1, name: "Alice" });
cache.set("user: 2", { id: 2, name: "Bob" });

// Get values
console.log("User 1:", cache.get("user: 1"));
console.log("User 2:", cache.get("user: 2"));

// Check existence
console.log("Has user: 1?", cache.has("user: 1"));
console.log("Has user: 999?", cache.has("user: 999"));

// Delete
cache.delete("user: 1");
console.log("After delete - Has user: 1?", cache.has("user: 1"));

// Size
console.log("Cache size", cache.size());
