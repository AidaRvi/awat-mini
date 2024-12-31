import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from './contact.schema';
import { CreateContactDto } from 'src/domain/Dto/create-contact.dto';
import { UpdateContactDto } from 'src/domain/Dto/update-contact.dto';

@Injectable()
export class ContactRepository {
  constructor(
    @InjectModel(Contact.name) private readonly contactModel: Model<Contact>,
  ) {}

  async createOne(dto: CreateContactDto) {
    await this.contactModel.create({
      phoneNumber: dto.phoneNumber,
      name: dto.name,
      _id: dto.id,
    });
  }

  async updateOne(dto: UpdateContactDto) {
    await this.contactModel.updateOne({ _id: dto.id }, dto);
  }

  async findOne(id: string) {
    const result = await this.contactModel.findById(id);
    return result;
  }
}
