# Performance Guide

## Best Practices

- **Monitor hit rates**: Aim for 80%+ hit rate
- **Use appropriate TTLs**: Balance freshness vs performance
- **Implement compression**: For large values
- **Use pipelines**: For multiple operations
- **Key naming**: Consistent, descriptive names

## Common Pitfalls

- ❌ Caching everything (waste memory)
- ❌ No TTL (stale data)
- ❌ Cache stampede (multiple requests)
- ❌ No monitoring (unknown performance)

## Optimization Tips

- Use Redis hashes for objects
- Implement cache warming
- Monitor memory usage
- Set up alerts for low hit rates
