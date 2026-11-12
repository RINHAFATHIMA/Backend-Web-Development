
'use strict';

const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
});

async function cacheGet(key) {
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (error) {
    console.error('[cache] GET error:', error.message);
    return null;
  }
}

async function cacheSet(key, data, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    console.error('[cache] SET error:', error.message);
  }
}

async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('[cache] DEL error:', error.message);
  }
}

module.exports = { cacheGet, cacheSet, cacheDel };
