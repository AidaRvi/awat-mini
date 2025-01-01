import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  async onModuleInit() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async setData(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async getData(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async delCache(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
