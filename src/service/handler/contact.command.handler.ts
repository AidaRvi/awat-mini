import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateContactCommand } from 'src/domain/commands/create-contact.command';
import { ContactRoot } from 'src/domain/models/contact.model';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateContactCommand)
export class CreateContactHandler
  implements ICommandHandler<CreateContactCommand>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly ESrepository: EventStoreService,
  ) {}

  async execute(command: CreateContactCommand) {
    // TODO: factory
    const contactRoot = new ContactRoot(
      uuidv4(),
      command.name,
      command.phoneNumber,
    );

    contactRoot.createContact();

    const doesExists = await this.checkIfPhoneNumberExists(command.phoneNumber);
    if (doesExists) {
      console.log('Duplicate PhoneNumber entered');
      return;
    }

    const contact = this.publisher.mergeObjectContext(contactRoot);

    contact.commit();
    console.log('Published');
  }

  async checkIfPhoneNumberExists(phoneNumber: number) {
    const allEvents = await this.ESrepository.getAllEvents();
    const duplicatedEvent = allEvents.find((event) => {
      if (
        event.type == 'ContactCreated' &&
        (event.data as any).phoneNumber === phoneNumber
      )
        return event.data;
    });

    if (duplicatedEvent) return true;
    return false;
  }
}
