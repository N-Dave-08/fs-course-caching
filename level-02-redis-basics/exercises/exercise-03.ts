import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function main() {
  await client.connect();

  //   1. LISTS - Ordered collection
  console.log("=== LISTS ===");
  await client.lPush("tasks", ["task1", "task2", "task3"]);
  const tasks = await client.lRange("tasks", 0, -1); // Get all
  console.log("All tasks:", tasks); // ['task3', 'task2', 'task1']

  await client.rPush("tasks", "task4"); // Add to end
  const allTasks = await client.lRange("tasks", 0, -1);
  console.log("Tasks after rPush:", allTasks);

  const firstTask = await client.lPop("tasks"); // Remove from start
  console.log("Popped task:", firstTask);

  //   2. SETS - Unique collection
  console.log("\n=== SETS ===");
  await client.sAdd("tags", ["javascript", "typescript", "nodejs"]);
  const tags = await client.sMembers("tags");
  console.log("All tags:", tags);

  await client.sAdd("tags", "javascript"); // Duplicate ignored
  const tagsAfter = await client.sMembers("tags");
  console.log("Tags after duplicate:", tagsAfter); // Same as before

  const hasTag = await client.sIsMember("tags", "typescript");
  console.log("Has typescript tag:", hasTag); // true

  //   3. SORTED SETS - Ordered with scores (leaderboard)
  console.log("\n=== SORTED SETS ===");
  await client.zAdd("leaderboard", [
    { score: 100, value: "Alice" },
    { score: 200, value: "Bob" },
    { score: 150, value: "Charlie" },
  ]);

  //   Get top 3 (highest scores)
  const topPlayers = await client.zRangeWithScores("leaderboard", 0, 2, {
    REV: true, // Reverse order (highest first)
  });
  console.log("Top 3 players:", topPlayers);

  //   Get rank of player
  const rank = await client.zRevRank("leaderboard", "Bob");

  if (rank !== null) {
    console.log("Bob rank:", rank + 1);
  } else {
    console.log("Bos is not on the leaderboard");
  }

  //   Increment score
  await client.zIncrBy("leaderboard", 50, "Alice");
  const updatedTop = await client.zRangeWithScores("leaderboard", 0, -1, {
    REV: true,
  });
  console.log("Updated leaderboard", updatedTop);

  await client.quit();
}

main().catch(console.error);
