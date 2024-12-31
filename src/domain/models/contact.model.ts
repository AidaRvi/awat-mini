import { AggregateRoot } from '@nestjs/cqrs';
import { ContactCreated } from '../events/create-contact.event';
import { ContactUpdated } from '../events/update-contact.event';

export class Contact extends AggregateRoot {
  private id: string;
  private name: string;
  private phoneNumber: number;

  constructor(id: string, name: string, phoneNumber?: number) {
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

  updateContact() {
    const contactEvent = new ContactUpdated(this.id, this.name);
    return this.apply(contactEvent);
  }
}
