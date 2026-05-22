import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL, // redis://redis:6379 in Docker
});

redis.on("error", (err) => console.log("Redis Error", err));

await redis.connect();

export default redis;