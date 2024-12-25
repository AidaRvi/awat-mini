import { Injectable } from '@nestjs/common';
import { ContactRoot } from 'src/domain/models/contact.model';
import { CreateContactDto } from 'src/domain/Dto/contact.dto';

@Injectable()
export class ContactRepository {
  constructor() {}

  async createOne(dto: CreateContactDto) {
    const contactRoot = new ContactRoot(dto.name, dto.phoneNumber);
    contactRoot.createdContact();
    return contactRoot;
  }
}
