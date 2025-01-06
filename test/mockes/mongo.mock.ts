import { Injectable } from '@nestjs/common';
import { UpdateContactDto } from 'src/domain/Dto/update-contact.dto';

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

  updateOne({ id, name }: UpdateContactDto) {
    this.store['contact'].find((contact) => contact.id == id).name = name;
  }
}
