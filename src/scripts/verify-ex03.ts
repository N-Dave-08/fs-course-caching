import redisClient from "../redis-client";
import cacheService from "../services/cache.service";

async function main() {
  await redisClient.connect();

  // Basic connectivity
  const pong = await redisClient.getClient().ping();
  console.log("PING:", pong);

  // Cache wrapper sanity check
  const key = "verify:ex03:v1";
  await cacheService.set(key, { ok: true, at: Date.now() }, 30);
  const value = await cacheService.get<{ ok: boolean; at: number }>(key);
  console.log("GET:", value);

  await cacheService.delete(key);
  const afterDelete = await cacheService.get(key);
  console.log("AFTER_DELETE:", afterDelete);

  await redisClient.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await redisClient.disconnect();
  } catch {}
  process.exitCode = 1;
});
