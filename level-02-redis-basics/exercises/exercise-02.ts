import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function main() {
  await client.connect();

  const userId = "user:1";

  //   HSET - set hash fields
  await client.hSet(userId, {
    name: "Alice",
    email: "alice@example.com",
    age: "25",
    role: "admin",
  });

  //   HGET - get single field
  const name = await client.hGet(userId, "name");
  console.log("User name:", name); // "Alilce"

  //   HGETALL - get all fields
  const user = await client.hGetAll(userId);
  console.log("Full user:", user);
  //   {name: 'Alice', email: 'alice@example.com', age: '25, role: 'admin'}

  //   HGET multiple fields
  const emailAndRole = await client.hmGet(userId, ["email", "role"]);
  console.log("Email and role:", emailAndRole);

  //   HINCRBY - increment numeric field
  await client.hIncrBy(userId, "age", 1);
  const newAge = await client.hGet(userId, "age");
  console.log("Updated age:", newAge); // "26"

  //   HDEL = delete field
  await client.hDel(userId, "role");
  const userAfterDelete = await client.hGetAll(userId);
  console.log("User after deleting role:", userAfterDelete);

  //   HEXISTS - check if field exists
  const hasEmail = Boolean(await client.hExists(userId, "email"));
  console.log("Has email field", hasEmail); // true

  await client.quit();
}

main().catch(console.error);
