import { performance } from "perf_hooks";
import userService from "../services/user.service";
import redisClient from "../redis-client"; // Import your client wrapper

async function main() {
  // 1. Establish the connection
  await redisClient.connect();
  console.log("--- Redis Connected ---");

  const start1 = performance.now();
  await userService.getUserById(1); // miss
  await userService.getUserById(1); // hit
  const end1 = performance.now();
  console.log("cache_aside_two_reads_ms:", (end1 - start1).toFixed(1));

  const created = await userService.createUser({
    name: "Test",
    email: "test@example.com",
  });

  const start2 = performance.now();
  await userService.getUserById(created.id); // should be hit (write-through)
  const end2 = performance.now();
  console.log("write_through_read_ms:", (end2 - start2).toFixed(1));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    // 2. Close the connection so the script can actually exit
    await redisClient.disconnect();
    console.log("--- Redis Disconnected ---");
  });
