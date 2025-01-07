import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactService } from '../service/contact.service';
import { CreateContactDto } from '../domain/Dto/create-contact.dto';
import { UpdateContactDto } from '../domain/Dto/update-contact.dto';

@Controller()
export class RabbitmqController {
  constructor(private readonly contactService: ContactService) {}

  @MessagePattern('create-contact')
  async createContact(@Payload() contactDto: CreateContactDto) {
    console.log('** Received a request for "creation":', contactDto);

    this.contactService.createContact(contactDto);

    return { status: 'success', receivedData: contactDto };
  }

  @MessagePattern('update-contact')
  async updateContact(@Payload() contactDto: UpdateContactDto) {
    console.log('** Received a request for "updating":', contactDto);

    await this.contactService.updateContact(contactDto);

    return { status: 'success', receivedData: contactDto };
  }
}
