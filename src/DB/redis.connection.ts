import { createClient } from "redis";
import chalk from "chalk";

export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
  database: 1,
  RESP: 2,
});
redisClient.on("error", (err) => {
  console.log(chalk.red("redis connection failed =>"), err);
});

redisClient.on("connect", () => {
  console.log(chalk.blue("redis connection successfully"));
});
