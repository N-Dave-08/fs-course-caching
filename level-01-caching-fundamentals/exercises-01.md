# Exercises 01: Caching Fundamentals

## Learning Objectives

By completing these exercises, you will:

- ✅ Implement basic in-memory cache operations
- ✅ Understand cache set, get, and delete operations
- ✅ Implement TTL (Time To Live) for cache expiration
- ✅ Track cache performance (hits/misses)
- ✅ Handle cache expiration logic
- ✅ Practice TypeScript with caching patterns

## Before You Start

**Prerequisites:**

- Node.js 22+ LTS
- TypeScript knowledge
- Understanding of key-value storage concepts

**Setup:**

1. Navigate to `fs-course-caching/level-01-caching-fundamentals/`
2. Create `exercises/` directory
3. All exercises should be created in this directory

---

## Exercise 1: Basic Cache Operations

**Objective:** Implement a simple in-memory cache with basic operations.

**Instructions:**
Create `exercises/exercise-01.ts` that implements:

1. Set value in cache
2. Get value from cache
3. Check if key exists
4. Delete key from cache

**Expected Code Structure:**

```typescript
// exercises/exercise-01.ts
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
   * Check if a key exists in the cache
   * @param key - Cache key
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
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Test the cache
const cache = new SimpleCache();

// Set values
cache.set("user:1", { id: 1, name: "Alice" });
cache.set("user:2", { id: 2, name: "Bob" });

// Get values
console.log("User 1:", cache.get("user:1"));
console.log("User 2:", cache.get("user:2"));

// Check existence
console.log("Has user:1?", cache.has("user:1"));
console.log("Has user:999?", cache.has("user:999"));

// Delete
cache.delete("user:1");
console.log("After delete - Has user:1?", cache.has("user:1"));

// Size
console.log("Cache size:", cache.size());
```

**Verification Steps:**

1. Run: `npx ts-node exercises/exercise-01.ts`
2. Check output - should show cache operations working
3. Verify set/get/delete operations

**Expected Output:**

```
User 1: { id: 1, name: 'Alice' }
User 2: { id: 2, name: 'Bob' }
Has user:1? true
Has user:999? false
After delete - Has user:1? false
Cache size: 1
```

**Hints:**

- Use `Map` for key-value storage
- Methods should be type-safe
- Return appropriate types for each operation

**Common Mistakes:**

- ❌ Not using TypeScript types
- ❌ Not handling undefined values
- ❌ Forgetting to implement all required methods

**File:** `exercises/exercise-01.ts`

---

## Exercise 2: TTL Implementation

**Objective:** Add Time To Live (TTL) functionality to the cache.

**Instructions:**
Extend the cache to support expiration:

1. Set value with expiration time
2. Check if key is expired
3. Automatically remove expired keys on get

**Expected Code Structure:**

```typescript
// exercises/exercise-02.ts
interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Timestamp when entry expires
}

class CacheWithTTL {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value with TTL
   * @param key - Cache key
   * @param value - Value to store
   * @param ttlMs - Time to live in milliseconds
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value, checking expiration
   * @param key - Cache key
   * @returns Value if exists and not expired, undefined otherwise
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined; // Key doesn't exist
    }

    // Check if expired
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

    return true;
  }

  /**
   * Delete a key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Test TTL cache
const cache = new CacheWithTTL();

// Set with 1 second TTL
cache.set("temp:1", "This expires in 1 second", 1000);
console.log("Immediately:", cache.get("temp:1")); // Should return value

// Wait and check (in real scenario, use setTimeout)
setTimeout(() => {
  console.log("After 1.5 seconds:", cache.get("temp:1")); // Should be undefined
}, 1500);

// Set with longer TTL
cache.set("user:1", { name: "Alice" }, 5000);
console.log("User with 5s TTL:", cache.get("user:1"));
```

**Verification Steps:**

1. Run the script
2. Verify immediate get returns value
3. Wait and verify expired entries are removed
4. Test with different TTL values

**Expected Behavior:**

- Values stored with expiration time
- Expired values automatically removed
- Non-expired values returned normally
- `has()` checks expiration

**Hints:**

- Store expiration timestamp with value
- Check expiration on every get/has operation
- Remove expired entries automatically
- Use `Date.now()` for current timestamp

**Common Mistakes:**

- ❌ Not checking expiration on get
- ❌ Not removing expired entries
- ❌ Wrong TTL calculation
- ❌ Not handling edge cases (negative TTL, etc.)

**File:** `exercises/exercise-02.ts`

---

## Exercise 3: Cache Hit/Miss Tracking

**Objective:** Track cache performance metrics.

**Instructions:**
Implement cache statistics:

1. Count cache hits (successful gets)
2. Count cache misses (failed gets)
3. Calculate hit rate percentage

**Expected Code Structure:**

```typescript
// exercises/exercise-03.ts
interface CacheStats {
  hits: number;
  misses: number;
  get hitRate(): number; // Calculated property
}

class CacheWithStats {
  private cache: Map<string, any> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    get hitRate(): number {
      const total = this.hits + this.misses;
      if (total === 0) return 0;
      return (this.hits / total) * 100;
    },
  };

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  get(key: string): any {
    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key);
    } else {
      this.stats.misses++;
      return undefined;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get hit rate as percentage
   */
  getHitRate(): number {
    return this.stats.hitRate;
  }
}

// Test cache with stats
const cache = new CacheWithStats();

// Populate cache
cache.set("key1", "value1");
cache.set("key2", "value2");

// Generate some hits and misses
cache.get("key1"); // Hit
cache.get("key2"); // Hit
cache.get("key3"); // Miss
cache.get("key1"); // Hit
cache.get("key4"); // Miss

// Check stats
const stats = cache.getStats();
console.log("Cache Statistics:");
console.log(`Hits: ${stats.hits}`);
console.log(`Misses: ${stats.misses}`);
console.log(`Hit Rate: ${cache.getHitRate().toFixed(2)}%`);
```

**Verification Steps:**

1. Run the script
2. Verify hits and misses are counted correctly
3. Check hit rate calculation
4. Test reset functionality

**Expected Output:**

```
Cache Statistics:
Hits: 3
Misses: 2
Hit Rate: 60.00%
```

**Hints:**

- Track hits/misses in get operations
- Calculate hit rate: `(hits / (hits + misses)) * 100`
- Use getter for computed property
- Reset stats when needed

**Common Mistakes:**

- ❌ Not tracking both hits and misses
- ❌ Wrong hit rate calculation
- ❌ Not handling division by zero
- ❌ Forgetting to reset stats

**File:** `exercises/exercise-03.ts`

---

## Running Exercises

### Run Individual Exercises

```bash
npx ts-node exercises/exercise-01.ts
npx ts-node exercises/exercise-02.ts
npx ts-node exercises/exercise-03.ts
```

### Run All Exercises

```bash
for file in exercises/exercise-*.ts; do
  echo "Running $file..."
  npx ts-node "$file"
  echo ""
done
```

### Run All Exercises (PowerShell)

If you’re on Windows PowerShell, use:

```powershell
Get-ChildItem exercises\exercise-*.ts | ForEach-Object {
  Write-Host ("Running " + $_.FullName + "...")
  npx ts-node $_.FullName
  Write-Host ""
}
```

## Verification Checklist

After completing all exercises, verify:

- [x] Basic cache operations work (set, get, delete, has)
- [x] TTL expiration works correctly
- [x] Expired entries are automatically removed
- [x] Cache statistics track hits and misses
- [x] Hit rate calculation is correct
- [x] All code is type-safe with TypeScript
- [x] No runtime errors

## Troubleshooting

### Issue: "Cannot find module"

**Solution:**

- Check file paths are correct
- Ensure TypeScript is configured
- Run from correct directory

### Issue: TTL not working

**Solution:**

- Check timestamp calculation
- Verify expiration check logic
- Use `Date.now()` not `new Date()`

### Issue: Stats not updating

**Solution:**

- Ensure stats are updated in get operations
- Check that hits/misses are incremented
- Verify stats object is not being recreated

## Next Steps

After completing these exercises:

1. ✅ **Review**: Understand caching fundamentals
2. ✅ **Experiment**: Add more features (max size, eviction policies)
3. ✅ **Practice**: Implement LRU (Least Recently Used) cache
4. 📖 **Continue**: Move to [Level 2: Redis Basics](../level-02-redis-basics/lesson-01-redis-introduction.md)
5. 💻 **Reference**: Check `project/` folder for complete implementation

## Additional Resources

- [Caching Strategies](<https://en.wikipedia.org/wiki/Cache_(computing)>)
- [TTL Concepts](https://en.wikipedia.org/wiki/Time_to_live)

---

**Key Takeaways:**

- Caching stores frequently accessed data in fast storage
- TTL prevents stale data by expiring entries
- Cache statistics help measure performance
- Hit rate indicates cache effectiveness
- In-memory caches are fast but limited by RAM

**Good luck! Happy coding! 🚀**
