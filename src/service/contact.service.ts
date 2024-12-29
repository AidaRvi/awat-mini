import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateContactCommand } from 'src/domain/commands/create-contact.command';
import { CreateContactDto } from 'src/domain/Dto/contact.dto';
import { CreateContactHandler } from './handler/contact.command.handler';

@Injectable()
export class ContactService {
  constructor(private commandBus: CommandBus) {}

  createContact(contactDto: CreateContactDto): Promise<any> {
    this.commandBus.register([CreateContactHandler]);
    const command = new CreateContactCommand(
      contactDto.id,
      contactDto.name,
      contactDto.phoneNumber,
    );
    return this.commandBus.execute(command);
  }
}
