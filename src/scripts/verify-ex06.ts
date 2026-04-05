import redisClient from "../redis-client";

async function main() {
  await redisClient.connect();

  // Basic diagnostics
  const memoryInfo = await redisClient.getClient().info("memory");
  const usedMemoryLine = memoryInfo
    .split("\n")
    .find((l) => l.startsWith("used_memory:"));
  console.log("memory_used_line:", usedMemoryLine?.trim());

  // Pipeline sanity check
  const pipeline = redisClient.getClient().multi();
  pipeline.set("batch:a", "1");
  pipeline.set("batch:b", "2");
  await pipeline.exec();
  console.log("pipeline_ok");

  await redisClient.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await redisClient.disconnect();
  } catch {}
  process.exitCode = 1;
});
