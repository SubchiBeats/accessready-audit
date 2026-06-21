import type { ConnectionOptions } from "bullmq";

export const SCAN_QUEUE_NAME = "access-audit-scans";

export function getRedisUrl() {
  const value = process.env.REDIS_URL || process.env.RAILWAY_REDIS_URL || process.env.UPSTASH_REDIS_URL;
  return value?.trim() || undefined;
}

export function isRedisQueueEnabled() {
  return Boolean(getRedisUrl());
}

export function createRedisConnectionOptions(): ConnectionOptions {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    throw new Error("REDIS_URL is required for the production scan queue.");
  }

  const url = new URL(redisUrl);
  const dbPath = url.pathname.replace(/^\/+/, "");
  const db = dbPath ? Number(dbPath) : undefined;

  return {
    host: url.hostname,
    port: Number(url.port || (url.protocol === "rediss:" ? 6380 : 6379)),
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: Number.isFinite(db) ? db : undefined,
    tls: url.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  } as ConnectionOptions;
}
