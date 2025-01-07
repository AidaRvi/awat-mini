import { Injectable } from '@nestjs/common';
import { UpdateContactDto } from 'src/domain/Dto/update-contact.dto';

@Injectable()
export class MockedContactRepository {
  private store: Record<string, any[]> = {};

  constructor() {
    this.store['contact'] = [];
  }

  createOne(document: any) {
    this.store['contact'].push(document);
  }

  findOne(id: string) {
    return this.store['contact'].find((contact) => contact.id == id);
  }

  updateOne({ id, name }: UpdateContactDto) {
    this.store['contact'].find((contact) => contact.id == id).name = name;
  }
}
