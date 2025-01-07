import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactService } from '../service/contact.service';
import { CreateContactDto } from '../domain/Dto/create-contact.dto';
import { UpdateContactDto } from '../domain/Dto/update-contact.dto';

@Controller()
export class RabbitmqController {
  constructor(private readonly contactService: ContactService) {}

  @MessagePattern('create-contact')
  async createContact(@Payload() createContactDto: CreateContactDto) {
    console.log('** Received a request for "creation":', createContactDto);

    this.contactService.createContact(createContactDto);
    return { correlationId: createContactDto.correlationId };
  }

  @MessagePattern('update-contact')
  async updateContact(@Payload() updateContactDto: UpdateContactDto) {
    console.log('** Received a request for "updating":', updateContactDto);

    await this.contactService.updateContact(updateContactDto);
    return { correlationId: updateContactDto.correlationId };
  }
}
