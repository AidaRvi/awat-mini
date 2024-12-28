import { IEvent } from '@nestjs/cqrs';

export class ContactEvent implements IEvent {
  constructor(
    public id: string,
    public readonly name: string,
    public readonly phoneNumber: number,
  ) {}
}

export class ContactCreated extends ContactEvent {}
