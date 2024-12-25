import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
// import { OrderCreatedEvent } from '../impl/order-created.event';
// import { OrdersRepository } from '../../orders.repository';
import { CreateContactEvent } from 'src/domain/events/create-contact.event';

@EventsHandler(CreateContactEvent)
export class ContactCreatedEventHandler
  implements IEventHandler<CreateContactEvent>
{
  // constructor(private readonly orderRepository: OrdersRepository) {}
  constructor() {}

  async handle(event: CreateContactEvent) {
    console.log(event);
    // await this.orderRepository.updateOne(id, { status: 'DELIVERED' });
  }
}
