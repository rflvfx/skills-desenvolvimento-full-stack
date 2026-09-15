import { createClient } from 'redis';
const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
client.on('error', e => console.log('Redis erro', e));
client.connect().catch(() => null);
export default client;
