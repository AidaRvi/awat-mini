import { IEvent } from '@nestjs/cqrs';

export class ContactUpdated implements IEvent {
  constructor(
    public id: string,
    public readonly name: string,
    public readonly correlationId: string,
  ) {}
}
