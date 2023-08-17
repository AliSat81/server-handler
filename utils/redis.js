import Redis from "ioredis";
import logger from "./logger.js";

function createRedisConnectionTest() {
  try {
    const { UPSTASH_REDIS_URL, UPSTASH_REDIS_PORT } = process.env;

    const client = new Redis({
      host: UPSTASH_REDIS_URL,
      port: UPSTASH_REDIS_PORT,
    });

    client.set("ezza", "ezza");
    // eslint-disable-next-line no-unused-vars
    client.get("ezza", function (err, result) {
      if (err) {
        logger.error(err);
      } else {
        logger.info("Redis connected successfully");
        client.disconnect();
      }
    });
  } catch (e) {
    console.log(e);
  }
}

function getRedisClient() {
  return new Promise((resolve, reject) => {
    try {
      const { UPSTASH_REDIS_URL, UPSTASH_REDIS_PORT } = process.env;

      const client = new Redis({
        host: UPSTASH_REDIS_URL,
        port: UPSTASH_REDIS_PORT,
      });

      client.set("ezza", "ezza", (redisSetMethodError) => {
        if (redisSetMethodError) {
          logger.error("Error from Redis set method", redisSetMethodError);
          reject(redisSetMethodError);
        } else {
          // eslint-disable-next-line no-unused-vars
          client.get("ezza", (redisGetMethodError, result) => {
            if (redisGetMethodError) {
              logger.error("Error from Redis get method", redisGetMethodError);
              reject(redisGetMethodError);
            } else {
              console.log("Redis connected successfully");
              resolve(client);
            }
          });
        }
      });
    } catch (e) {
      logger.error("Error from Redis connection", e);
      reject(e);
    }
  });
}

export {
  createRedisConnectionTest,
  getRedisClient,
};
