import { Injectable } from '@nestjs/common';

@Injectable()
export class MockedContactRepository {
  static instanceCount = 0;
  private store: Record<string, any[]> = {};

  constructor() {
    MockedContactRepository.instanceCount += 1;

    this.store['contact'] = [];
  }

  createOne(document: any) {
    this.store['contact'].push(document);
  }

  findOne(id: string) {
    return this.store['contact'].find((contact) => contact.id == id);
  }

  static getInstanceCount() {
    return MockedContactRepository.instanceCount;
  }
}
