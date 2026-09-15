import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
client.on('error', () => null);
client.connect().catch(() => null);

export async function getCache(key: string) {
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

export async function setCache(key: string, value: any, ttl = 300) {
  await client.set(key, JSON.stringify(value), { EX: ttl });
}

export async function delCache(key: string) {
  await client.del(key);
}

export async function delCachePattern(pattern: string) {
  const keys = await client.keys(pattern);
  if (keys.length) await client.del(keys);
}
