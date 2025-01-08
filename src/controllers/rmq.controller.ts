import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ContactService } from '../service/contact.service';
import { CreateContactDto } from '../domain/Dto/create-contact.dto';
import { UpdateContactDto } from '../domain/Dto/update-contact.dto';

@Controller()
export class RabbitmqController {
  constructor(private readonly contactService: ContactService) {}

  @MessagePattern('create-contact')
  async createContact(@Payload() createContactDto: CreateContactDto) {
    console.log('** Received a request for "creation":', createContactDto);

    try {
      await this.contactService.createContact(createContactDto);
      return { correlationId: createContactDto.correlationId };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('update-contact')
  async updateContact(@Payload() updateContactDto: UpdateContactDto) {
    console.log('** Received a request for "updating":', updateContactDto);

    try {
      await this.contactService.updateContact(updateContactDto);
      return { correlationId: updateContactDto.correlationId };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
