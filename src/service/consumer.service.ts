import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactService } from '../service/contact.service';
import { CreateContactDto } from '../domain/Dto/create-contact.dto';
import { UpdateContactDto } from '../domain/Dto/update-contact.dto';

@Controller()
export class ConsumerService {
  constructor(private readonly contactService: ContactService) {}

  @MessagePattern('create-contact')
  createContact(@Payload() contactDto: CreateContactDto) {
    console.log('Received message from "create-contact":', contactDto);

    this.contactService.createContact(contactDto);

    return { status: 'success', receivedData: contactDto };
  }

  @MessagePattern('update-contact')
  updateContact(@Payload() contactDto: UpdateContactDto) {
    console.log('Received message from "update-contact":', contactDto);

    this.contactService.updateContact(contactDto);

    return { status: 'success', receivedData: contactDto };
  }
}
