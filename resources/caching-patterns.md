# Caching Patterns

## Cache-Aside

```typescript
// Check cache → Fetch if miss → Store in cache
const cached = await cache.get(key);
if (!cached) {
  const data = await fetchData();
  await cache.set(key, data);
  return data;
}
return cached;
```

## Write-Through

```typescript
// Write to cache and database
await database.save(data);
await cache.set(key, data);
```

## Write-Behind

```typescript
// Write to cache, queue database write
await cache.set(key, data);
queueDatabaseWrite(key, data);
```

## Cache Invalidation

```typescript
// Invalidate on update
await database.update(id, data);
await cache.del(`key:${id}`);
```
