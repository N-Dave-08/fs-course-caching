import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function main() {
  await client.connect();

  //   SET and GET
  await client.set("user1:name", "Alice");
  const name = await client.get("user1:name");
  console.log("User name:", name);

  //   SETEX - set with expiration (TTL in seconds)
  await client.setEx("session:abc123", 3600, "session-data"); // expires in 1hr
  const session = await client.get("session:abc123");
  console.log("Session:", session);

  //   Check TTL
  const ttl = await client.ttl("session:abc123");
  console.log("Session TTL:", ttl, "seconds");

  //   INCR = increment number
  await client.set("counter", "0");
  const count1 = await client.incr("counter");
  const count2 = await client.incr("counter");
  console.log("Counter after increments:", count2); // 2

  //   DECR = decrement number
  const count3 = await client.decr("counter");
  console.log("Counter after decrement:", count3); // 1

  //   GET current value
  const currentCount = await client.get("counter");
  console.log("Current counter value:", currentCount); // "1"

  // DEL - delete key
  await client.del("user1:name");
  const deleted = await client.get("user1:name");
  console.log("After delete:", deleted); // null

  await client.quit();
}

main().catch(console.error);
