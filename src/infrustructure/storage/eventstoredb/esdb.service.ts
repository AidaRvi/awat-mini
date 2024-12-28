import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IEvent, IEventPublisher } from '@nestjs/cqrs';
import {
  AllStreamRecordedEvent,
  EventStoreDBClient,
  jsonEvent,
} from '@eventstore/db-client';

@Injectable()
export class EventStoreService implements IEventPublisher, OnModuleInit {
  constructor() {}

  private client: EventStoreDBClient;

  onModuleInit() {
    this.client = EventStoreDBClient.connectionString(
      'esdb://localhost:2113?tls=false',
    );
  }

  async publish<T extends IEvent>(event: T) {
    const message = JSON.parse(JSON.stringify(event));
    const contactId = message.id || message.Dto.id;
    const streamName = `contacts-${contactId}`;
    const type = event.constructor.name;

    const data = jsonEvent({
      type,
      data: message,
    });

    try {
      await this.client.appendToStream(streamName, data);
    } catch (err) {
      Logger.error(err);
    }
  }

  async getAllEvents(): Promise<AllStreamRecordedEvent[]> {
    const events: any[] = [];
    const readResult = this.client.readAll();

    for await (const resolvedEvent of readResult)
      events.push(resolvedEvent.event);

    return events;
  }
}
