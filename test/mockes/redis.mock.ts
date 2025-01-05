import { Injectable } from '@nestjs/common';

@Injectable()
export class mockRedisService {
  private store: Record<string, any> = {};

  setData(key: string, value: any) {
    this.store[key] = value;
  }

  getData(key: string) {
    return this.store[key];
  }
}
