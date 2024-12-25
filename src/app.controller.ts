import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './service/contact.service';
import { CreateContactDto } from './domain/Dto/contact.dto';

@Controller('/contacts')
export class AppController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  createContact(@Body() contactDto: CreateContactDto) {
    return this.contactService.createContact(contactDto);
  }
}
