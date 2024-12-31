import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContactCreated } from 'src/domain/events/create-contact.event';
import { ContactRepository } from 'src/infrustructure/storage/mongodb/contact.repository';

@EventsHandler(ContactCreated)
export class CreateContactEventHandler
  implements IEventHandler<ContactCreated>
{
  constructor(private readonly contactRepository: ContactRepository) {}

  async handle(query: ContactCreated): Promise<void> {
    await this.contactRepository.createOne(query);
    console.log('** Contact created');
  }
}
