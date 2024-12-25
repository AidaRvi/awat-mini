import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateContactCommand } from 'src/domain/commands/create-contact.command';
import { CreateContactEvent } from 'src/domain/events/create-contact.event';
import { ContactRepository } from 'src/infrustructure/storage/eventstoredb/contact.repository';
import { EventstoreRepository } from 'src/infrustructure/storage/eventstoredb/eventstoredb.repository';

@CommandHandler(CreateContactCommand)
export class CreateContactHandler
  implements ICommandHandler<CreateContactCommand>
{
  constructor(
    private contactRepository: ContactRepository,
    private ESrepository: EventstoreRepository,
    private publisher: EventPublisher,
  ) {}

  async execute(command: CreateContactCommand) {
    const contactEvent = new CreateContactEvent(
      command.name,
      command.phoneNumber,
    );

    console.log('published');
  }
}
