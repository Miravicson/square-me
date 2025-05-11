import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');
    this.redis = new Redis(redisUrl);
  }

  /**
   * Check if a key exists in Redis
   * @param key Redis key
   * @returns true if key exists, false otherwise
   */
  async hasKey(key: string): Promise<boolean> {
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  async setString(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async getString(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async setHash(key: string, data: Record<string, string>) {
    await this.redis.hmset(key, data);
  }

  async getHash(key: string): Promise<Record<string, string>> {
    const data = await this.redis.hgetall(key);
    return data;
  }

  async pushToList(key: string, value: string) {
    await this.redis.lpush(key, value);
  }

  async popFromList(key: string): Promise<string | null> {
    return this.redis.rpop(key);
  }

  async addToSet(key: string, value: string) {
    await this.redis.sadd(key, value);
  }

  async isMemberOfSet(key: string, value: string): Promise<boolean> {
    return (await this.redis.sismember(key, value)) === 1;
  }

  async addToSortedSet(key: string, score: number, value: string) {
    await this.redis.zadd(key, score, value);
  }

  async getTopFromSortedSet(key: string, count = 10): Promise<string[]> {
    return this.redis.zrevrange(key, 0, count - 1);
  }

  async delete(key: string) {
    await this.redis.del(key);
  }

  async setHashField(
    hashKey: string,
    field: string,
    value: string
  ): Promise<number> {
    return this.redis.hset(hashKey, field, value);
  }

  async getHashField(hashKey: string, field: string): Promise<string | null> {
    return this.redis.hget(hashKey, field);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async getSetMembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }
}
