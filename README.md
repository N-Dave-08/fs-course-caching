# Full Stack Course: Caching

Master Redis caching for high-performance applications.

## Overview

This course teaches Redis caching strategies to improve application performance. You'll learn caching fundamentals, Redis operations, caching patterns, and production optimization.

## Prerequisites

- Node.js 22+ LTS
- pnpm package manager
- Basic understanding of backend concepts

## Course Structure

This course consists of **6 progressive levels**:

1. **Level 1: Caching Fundamentals** - Introduction, concepts, cache types
2. **Level 2: Redis Basics** - Redis introduction, commands, data structures
3. **Level 3: Redis Integration** - node-redis setup, connection management, operations
4. **Level 4: Caching Strategies** - Cache-aside, write-through, write-behind
5. **Level 5: Advanced Caching** - Cache invalidation, TTL strategies, cache warming
6. **Level 6: Production Caching** - Monitoring, optimization, patterns

## Tech Stack

- **Redis**: 8.4+ (cache server)
- **node-redis** (`redis` npm package): 5.10+ (Redis client)
- **Node.js**: 22+ LTS

## Getting Started

1. **Read the Setup Guide**: Start with [LEARNING-GUIDE.md](./LEARNING-GUIDE.md)
2. **Install Redis**: Follow guide to set up Redis
3. **Start Learning**: Begin with Level 1

## Related Courses

- **fs-course-backend** - Integrate caching into Express.js APIs
- **fs-course-infrastructure** - Deploy Redis in production
- **fs-course-database** - Cache database queries

## Cross-Repository Integration

This caching course enhances performance across the stack:

- **Integrates with**: `fs-course-backend` (API response caching)
- **Deployed with**: `fs-course-infrastructure` (Redis container/ElastiCache)
- **Optimizes**: Database queries from `fs-course-database`

### Integration Points

1. **Backend Integration**:
   - Cache API responses in Express.js
   - Cache database query results
   - Session storage with Redis
   - Connection: `REDIS_URL` environment variable

2. **Infrastructure Integration**:
   - Redis container in Docker Compose
   - ElastiCache for AWS deployment
   - Redis monitoring and scaling

3. **Performance Optimization**:
   - Reduce database load
   - Faster API responses
   - Better user experience

### Environment Variables

```env
# Redis connection (used by backend)
REDIS_URL=redis://localhost:6379

# Production Redis (from infrastructure)
REDIS_URL=redis://elasticache-endpoint:6379
```

### Caching Strategy

- **Cache-aside**: Backend checks cache, falls back to database
- **Write-through**: Write to cache and database simultaneously
- **TTL**: Time-to-live for cache expiration
