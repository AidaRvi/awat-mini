import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactService } from './service/contact.service';
import { CreateContactDto } from './domain/Dto/contact.dto';

@Controller()
export class ConsumerService {
  constructor(private readonly contactService: ContactService) {}

  @MessagePattern({ cmd: 'send_message' })
  handleMessage(@Payload() contactDto: CreateContactDto) {
    console.log('Received message from RabbitMQ:', contactDto);

    this.contactService.createContact(contactDto);

    return { status: 'success', receivedData: contactDto };
  }
}
