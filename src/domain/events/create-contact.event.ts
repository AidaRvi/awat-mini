import { IEvent } from '@nestjs/cqrs';

export class ContactCreated implements IEvent {
  constructor(
    public id: string,
    public readonly name: string,
    public readonly phoneNumber: number,
    public readonly correlationId: string,
  ) {}
}
