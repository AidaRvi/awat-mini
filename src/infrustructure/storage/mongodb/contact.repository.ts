import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from './contact.schema';
import { CreateContactDto } from 'src/domain/Dto/contact.dto';

@Injectable()
export class ContactRepository {
  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<Contact>,
  ) {}

  async createOne(dto: CreateContactDto) {
    await this.contactModel.create(dto);
  }
}
