import { AggregateRoot } from '@nestjs/cqrs';
import { ContactCreated } from '../events/create-contact.event';

export class ContactRoot extends AggregateRoot {
  private id: string;
  private name: string;
  private phoneNumber: number;

  constructor(id: string, name: string, phoneNumber: number) {
    super();
    this.id = id;
    this.name = name;
    this.phoneNumber = phoneNumber;
  }
  // action
  // applicator
  createContact() {
    const contactEvent = new ContactCreated(
      this.id,
      this.name,
      this.phoneNumber,
    );
    return this.apply(contactEvent);
  }
}
