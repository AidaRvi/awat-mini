import { Injectable } from '@nestjs/common';

@Injectable()
export class mockContactModel {
  private store: Record<string, any[]> = {};

  insertOne(collection: string, document: any) {
    if (!this.store[collection]) this.store[collection] = [];
    this.store[collection].push(document);
  }

  findOne(collection: string, query: any) {
    return this.store[collection] || null;
  }
}
