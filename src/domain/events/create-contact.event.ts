import { IEvent } from '@nestjs/cqrs';

export class ContactEvent implements IEvent {
  constructor(
    public readonly name: string,
    public readonly phoneNumber: number,
  ) {}
}

export class CreateContactEvent extends ContactEvent {}
