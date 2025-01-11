import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ContactCreated } from 'src/domain/events/create-contact.event';
import { ContactRepository } from 'src/infrustructure/storage/mongodb/contact.repository';
import { RedisService } from 'src/infrustructure/storage/redis/redis.service';

@EventsHandler(ContactCreated)
export class CreateContactEventHandler
  implements IEventHandler<ContactCreated>
{
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly redisService: RedisService,
  ) {}

  async handle(event: ContactCreated): Promise<void> {
    try {
      await this.contactRepository.createOne(event);
    } catch (err) {
      console.log(err.message);
      return;
    }
    console.log('** Contact created');
    await this.redisService.setData(event.correlationId, 'completed');
  }
}
