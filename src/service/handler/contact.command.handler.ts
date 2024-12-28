import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateContactCommand } from 'src/domain/commands/create-contact.command';
import { ContactRoot } from 'src/domain/models/contact.model';
import { EventstoreRepository } from 'src/infrustructure/storage/eventstoredb/eventstoredb.repository';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateContactCommand)
export class CreateContactHandler
  implements ICommandHandler<CreateContactCommand>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly ESrepository: EventstoreRepository,
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
    const contactCreatedEvents = allEvents.filter((event) => {
      if (
        event.streamId.startsWith('contact_') &&
        event.type == 'ContactCreated'
      )
        return event.data;
    });

    for (const event of contactCreatedEvents) {
      //@ts-ignore
      if (event.data.phoneNumber === phoneNumber) {
        return true;
      }
    }
    return false;
  }
}
