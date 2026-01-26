# Redis Cheatsheet

## Basic Operations

```typescript
await client.set('key', 'value');
await client.get('key');
await client.del('key');
await client.setEx('key', 3600, 'value'); // TTL
```

## Hashes

```typescript
await client.hSet('user:1', { name: 'Alice', email: 'alice@example.com' });
await client.hGetAll('user:1');
await client.hGet('user:1', 'name');
```

## Lists

```typescript
await client.lPush('list', 'item');
await client.rPush('list', 'item');
await client.lRange('list', 0, -1);
```

## Sets

```typescript
await client.sAdd('set', 'member');
await client.sMembers('set');
await client.sIsMember('set', 'member');
```
