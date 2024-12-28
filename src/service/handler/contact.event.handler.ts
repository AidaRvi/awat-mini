import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
// import { OrderCreatedEvent } from '../impl/order-created.event';
// import { OrdersRepository } from '../../orders.repository';
import { ContactCreated } from 'src/domain/events/create-contact.event';

@EventsHandler(ContactCreated)
export class ContactCreatedEventHandler
  implements IEventHandler<ContactCreated>
{
  // constructor(private readonly orderRepository: OrdersRepository) {}
  constructor() {}

  async handle(event: ContactCreated) {
    console.log(event);
    // await this.orderRepository.updateOne(id, { status: 'DELIVERED' });
  }
}
