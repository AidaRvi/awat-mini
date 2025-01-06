import { AggregateRoot } from '@nestjs/cqrs';
import { ContactCreated } from '../events/create-contact.event';
import { ContactUpdated } from '../events/update-contact.event';
import { EventType, ResolvedEvent } from '@eventstore/db-client';

export class Contact extends AggregateRoot {
  private id: string;
  private name: string;
  private phoneNumber: number;

  constructor() {
    super();
  }

  public onContactCreated(event: ContactCreated): void {
    this.id = event.id;
    this.name = event.name;
    this.phoneNumber = event.phoneNumber;
  }

  public onContactUpdated(event: ContactUpdated): void {
    if (event.name) this.name = event.name;
  }

  createContact(id: string, name: string, phoneNumber: number) {
    this.apply(new ContactCreated(id, name, phoneNumber));
  }

  getContact() {
    return { id: this.id, name: this.name, phoneNumber: this.phoneNumber };
  }

  async isUpdateValid(events: ResolvedEvent<EventType>[]): Promise<boolean> {
    const maxUpdateCount = 5;
    let count = 0;

    for (const event of events) {
      // @ts-ignore
      if (event.type == 'ContactUpdated') count++;
      if (count >= maxUpdateCount) return false;
    }

    return true;
  }

  public static rehydrate(events: any[]): Contact {
    const contact = new Contact();
    for (const event of events) {
      contact.apply(event);
    }
    return contact;
  }

  public updateContact(name?: string) {
    this.apply(new ContactUpdated(this.id, name));
  }
}
