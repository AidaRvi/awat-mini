import { AggregateRoot } from '@nestjs/cqrs';
import { ContactCreated } from '../events/create-contact.event';
import { ContactUpdated } from '../events/update-contact.event';
import { EventType, ResolvedEvent } from '@eventstore/db-client';

export class Contact extends AggregateRoot {
  private id: string;
  private name: string;
  private phoneNumber: number;
  private updateCount: number = 0;

  private static readonly MAX_UPDATES = 5;

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
    this.updateCount++;
  }

  createContact(id: string, name: string, phoneNumber: number) {
    this.apply(new ContactCreated(id, name, phoneNumber));
  }

  getContact() {
    return { id: this.id, name: this.name, phoneNumber: this.phoneNumber };
  }

  public static rehydrate(events: any[]): Contact {
    const contact = new Contact();
    for (const event of events) {
      contact.handleEvent(event);
    }
    return contact;
  }

  public updateContact(name?: string) {
    if (this.updateCount >= Contact.MAX_UPDATES) {
      console.log('** Contact update limit exceeded');
      throw new Error(`Contact update limit exceeded`);
    }
    this.apply(new ContactUpdated(this.id, name));
  }

  private handleEvent(event: any) {
    if (event instanceof ContactCreated) {
      this.onContactCreated(event);
    } else if (event instanceof ContactUpdated) {
      this.onContactUpdated(event);
    }
  }

  static checkIfPhoneNumberExists(phoneNumber: number, events: any[]): boolean {
    return events.some(
      (event) =>
        event.type === 'ContactCreated' &&
        (event.data as any).phoneNumber === phoneNumber,
    );
  }
}
