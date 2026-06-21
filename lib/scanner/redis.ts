import IORedis from "ioredis";

export const SCAN_QUEUE_NAME = "access-audit-scans";

export function getRedisUrl() {
  return process.env.REDIS_URL || process.env.RAILWAY_REDIS_URL || process.env.UPSTASH_REDIS_URL;
}

export function isRedisQueueEnabled() {
  return Boolean(getRedisUrl());
}

export function createRedisConnection() {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    throw new Error("REDIS_URL is required for the production scan queue.");
  }

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}
