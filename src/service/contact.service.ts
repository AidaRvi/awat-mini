import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateContactCommand } from 'src/domain/commands/create-contact.command';
import { CreateContactDto } from 'src/domain/Dto/create-contact.dto';
import { CreateContactHandler } from './handler/create-contact.command.handler';
import { UpdateContactDto } from 'src/domain/Dto/update-contact.dto';
import { UpdateContactCommand } from 'src/domain/commands/update-contact.command';
import { UpdateContactHandler } from './handler/update-contact.command.handler';

@Injectable()
export class ContactService {
  constructor(private commandBus: CommandBus) {
    this.commandBus.register([CreateContactHandler, UpdateContactHandler]);
  }

  async createContact(contactDto: CreateContactDto): Promise<any> {
    const command = new CreateContactCommand(
      contactDto.id,
      contactDto.name,
      contactDto.phoneNumber,
      contactDto.correlationId,
    );

    const result = await this.commandBus.execute(command);
    return result;
  }

  async updateContact(contactDto: UpdateContactDto): Promise<any> {
    const command = new UpdateContactCommand(
      contactDto.id,
      contactDto.name,
      contactDto.correlationId,
    );
    const result = await this.commandBus.execute(command);
    return result;
  }
}
