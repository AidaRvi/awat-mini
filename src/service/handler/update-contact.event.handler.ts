import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContactUpdated } from 'src/domain/events/update-contact.event';
import { ContactRepository } from 'src/infrustructure/storage/mongodb/contact.repository';
import { RedisService } from 'src/infrustructure/storage/redis/redis.service';

@EventsHandler(ContactUpdated)
export class UpdateContactEventHandler
  implements IEventHandler<ContactUpdated>
{
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly redisService: RedisService,
  ) {}

  async handle(event: ContactUpdated): Promise<void> {
    const contact = await this.contactRepository.findOne(event.id);
    if (!contact) {
      console.log('Contact not found');
      await this.redisService.setData(event.correlationId, 'failed');
      return;
    }

    await this.contactRepository.updateOne(event);
    await this.redisService.setData(event.correlationId, 'completed');

    console.log('** Contact Updated');
  }
}
