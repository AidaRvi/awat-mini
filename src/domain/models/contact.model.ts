import { AggregateRoot } from '@nestjs/cqrs';
import { CreateContactEvent } from '../events/create-contact.event';

export class ContactRoot extends AggregateRoot {
  private name: string;
  private phoneNumber: number;

  constructor(name: string, phoneNumber: number) {
    super();
    this.name = name;
    this.phoneNumber = phoneNumber;
  }

  createdContact() {
    this.apply(new CreateContactEvent(this.name, this.phoneNumber));
  }

  createdContact() {
    this.apply(new CreateContactEvent(this.name, this.phoneNumber));
  }
}
