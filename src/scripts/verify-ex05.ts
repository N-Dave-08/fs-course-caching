import redisClient from "../redis-client";
import cacheInvalidation from "../services/cache-invalidation";
import ttlStrategies from "../services/ttl-strategies";
import cacheWarming from "../services/cache-warming";

async function main() {
  await redisClient.connect();

  // Tags + invalidation
  await redisClient.getClient().set("user:1", JSON.stringify({ id: 1 }));
  await cacheInvalidation.addTag("user:1", "users");
  await cacheInvalidation.invalidateByTag("users");
  console.log("invalidated_by_tag_ok");

  // TTL strategies
  await ttlStrategies.setWithFixedTTL("ttl:fixed", { ok: true }, 30);
  await ttlStrategies.getWithSlidingTTL("ttl:fixed", 30);
  await ttlStrategies.setWithAdaptiveTTL("ttl:adaptive", { ok: true }, 10);
  console.log("ttl_strategies_ok");

  // Warming
  await cacheWarming.warmOnStartup();
  const warmed = await redisClient.getClient().get("user:1");
  console.log("warmed_user_1:", warmed);

  await redisClient.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await redisClient.disconnect();
  } catch {}
  process.exitCode = 1;
});
