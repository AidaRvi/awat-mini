import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContactUpdated } from 'src/domain/events/update-contact.event';
import { ContactRepository } from 'src/infrustructure/storage/mongodb/contact.repository';

@EventsHandler(ContactUpdated)
export class UpdateContactEventHandler
  implements IEventHandler<ContactUpdated>
{
  constructor(private readonly contactRepository: ContactRepository) {}

  async handle(event: ContactUpdated): Promise<void> {
    const contact = await this.contactRepository.findOne(event.id);
    if (!contact) {
      console.log('Contact not found');
      return;
    }

    await this.contactRepository.updateOne(event);
    console.log('** Contact Updated');
  }
}
