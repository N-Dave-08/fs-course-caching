# Caching Course Setup Guide

Complete setup instructions for the Redis caching course.

## Prerequisites

1. **Node.js 22+ LTS**
2. **pnpm** package manager
3. **Redis 8.4+** (or Docker)

## Initial Setup

### Step 1: Install Redis

**Option A: Docker (Recommended)**
```bash
docker run -d -p 6379:6379 redis:8.4
```

**Option B: Native Installation**
- macOS: `brew install redis`
- Linux: `apt-get install redis-server`
- Windows: Use WSL or Docker

### Step 2: Verify Redis

```bash
redis-cli ping
# Should return: PONG
```

### Step 3: Navigate to Course Directory

```bash
cd fs-course-caching
```

### Step 4: Initialize Package.json

```bash
pnpm init
```

### Step 5: Install Dependencies

```bash
pnpm add redis@^5.10.0

# TypeScript tooling
pnpm add -D typescript@^5.9.3 ts-node@^10.9.2

# Node types: if you’re on Node 22, keep @types/node on the 22.x line
pnpm add -D @types/node@^22.19.7
```

### Step 6: Create TypeScript Config

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Step 7: Test Connection

Create `test-connection.ts`:

```typescript
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

async function test() {
  await client.connect();
  await client.set('test', 'Hello Redis!');
  const value = await client.get('test');
  console.log('✅ Redis connection successful!', value);
  await client.quit();
}

test();
```

Run: `npx ts-node test-connection.ts`

## Workflow

### Running Redis Commands

```typescript
import { createClient } from 'redis';

const client = createClient();
await client.connect();

await client.set('key', 'value');
const value = await client.get('key');
```

## Troubleshooting

### Redis Connection Error

- Verify Redis is running: `redis-cli ping`
- Check REDIS_URL in environment
- Verify port 6379 is accessible

## Next Steps

1. ✅ Verify setup with test-connection.ts
2. 📖 Start with [Level 1: Caching Fundamentals](./level-01-caching-fundamentals/lesson-01-introduction.md)

Happy caching! 🚀
