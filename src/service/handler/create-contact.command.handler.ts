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
    const events = await this.ESrepository.getStream(`contacts-${command.id}`);

    if (events.length) {
      this.redisService.setData(command.correlationId, 'failed');
      console.log('* Error: Contact exists!');
      throw new Error('Contact exists');
    }

    const allEvents = await this.ESrepository.getAllEvents();
    const doesExists = Contact.checkIfPhoneNumberExists(
      command.phoneNumber,
      allEvents,
    );

    if (doesExists) {
      this.redisService.setData(command.correlationId, 'failed');
      console.log('* Error: Duplicate PhoneNumber entered');
      throw new Error('Duplicated PhoneNumber entered');
    }

    const contactRoot = new Contact();
    contactRoot.createContact(
      command.id,
      command.name,
      command.phoneNumber,
      command.correlationId,
    );

    const contact = this.publisher.mergeObjectContext(contactRoot);
    contact.commit();

    await this.redisService.setData(command.correlationId, 'published');
    console.log('** Published');
  }
}
