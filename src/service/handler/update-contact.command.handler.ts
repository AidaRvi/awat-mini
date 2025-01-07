import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateContactCommand } from 'src/domain/commands/update-contact.command';
import { Contact } from 'src/domain/models/contact.model';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';
import { RedisService } from 'src/infrustructure/storage/redis/redis.service';

@CommandHandler(UpdateContactCommand)
export class UpdateContactHandler
  implements ICommandHandler<UpdateContactCommand>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly ESrepository: EventStoreService,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: UpdateContactCommand) {
    const streamName = `contacts-${command.id}`;
    const events = await this.ESrepository.loadEvents(streamName);

    if (!events.length) {
      console.log('* Error: contact does not exist');
      this.redisService.setData(`update:${command.id}`, 'failed');
      return;
    }

    const contactRoot = Contact.rehydrate(events);

    const isValid = await contactRoot.isUpdateValid(events);
    if (!isValid) {
      console.log('* Error: Can not update a contact more than 5 times!');
      this.redisService.setData(`update:${command.id}`, 'failed');
      return;
    }

    const wrappedContact = this.publisher.mergeObjectContext(contactRoot);
    wrappedContact.updateContact(command.name);

    wrappedContact.commit();

    this.redisService.setData(`update:${command.id}`, 'published');
    console.log('** Update-contact published');
  }
}
