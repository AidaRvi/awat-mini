import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateContactCommand } from 'src/domain/commands/create-contact.command';
import { Contact } from 'src/domain/models/contact.model';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';
import { RedisService } from 'src/infrustructure/storage/redis/redis.service';

@CommandHandler(CreateContactCommand)
export class CreateContactHandler
  implements ICommandHandler<CreateContactCommand>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly redisService: RedisService,
    private readonly ESrepository: EventStoreService,
  ) {}

  async execute(command: CreateContactCommand) {
    // TODO: factory
    // const contactRoot = Contact.createContact(
    //   command.id,
    //   command.name,
    //   command.phoneNumber,
    // );

    const events = await this.ESrepository.getStream(`contacts-${command.id}`);

    if (events.length) {
      console.log('* Error: Contact exists!');
      this.redisService.setData(`create:${command.id}`, 'failed');
      return;
    }

    const doesExists = await this.checkIfPhoneNumberExists(command.phoneNumber);
    if (doesExists) {
      console.log('* Error: Duplicate PhoneNumber entered');
      this.redisService.setData(`create:${command.id}`, 'failed');
      return;
    }

    const contactRoot = new Contact();
    contactRoot.createContact(command.id, command.name, command.phoneNumber);

    const contact = this.publisher.mergeObjectContext(contactRoot);
    contact.commit();

    await this.redisService.setData(`create:${command.id}`, 'published');
    console.log('** Published');
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
