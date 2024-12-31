import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UpdateContactCommand } from 'src/domain/commands/update-contact.command';
import { Contact } from 'src/domain/models/contact.model';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';

@CommandHandler(UpdateContactCommand)
export class UpdateContactHandler
  implements ICommandHandler<UpdateContactCommand>
{
  constructor(
    private readonly publisher: EventPublisher,
    private readonly ESrepository: EventStoreService,
  ) {}

  async execute(command: UpdateContactCommand) {
    const streamName = `contacts-${command.id}`;
    const stream = await this.ESrepository.getStream(streamName);

    if (!stream) {
      console.log('contact does not exist!');
      return;
    }

    const contactRoot = new Contact(command.id, command.name);

    contactRoot.updateContact();

    const contact = this.publisher.mergeObjectContext(contactRoot);

    contact.commit();
    console.log('Update-contact published');
  }
}
