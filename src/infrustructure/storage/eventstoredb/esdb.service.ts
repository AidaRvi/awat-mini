import { Injectable, OnModuleInit } from '@nestjs/common';
import { IEvent, IEventPublisher, EventBus } from '@nestjs/cqrs';
import {
  AllStreamRecordedEvent,
  EventType,
  jsonEvent,
  ResolvedEvent,
} from '@eventstore/db-client';
import { ContactCreated } from 'src/domain/events/create-contact.event';
import { CreateContactEventHandler } from 'src/service/handler/create-contact.event.handler';
import { UpdateContactEventHandler } from 'src/service/handler/update-contact.event.handler';
import { ContactUpdated } from 'src/domain/events/update-contact.event';
import { EventStoreRepository } from './esdb.repository';

@Injectable()
export class EventStoreService implements IEventPublisher, OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly esRepository: EventStoreRepository,
  ) {}

  onModuleInit() {
    this.eventBus.register([
      CreateContactEventHandler,
      UpdateContactEventHandler,
    ]);
  }

  async publish<T extends IEvent>(event: T) {
    const message = JSON.parse(JSON.stringify(event));
    const contactId = message.id;
    const streamName = `contacts-${contactId}`;
    const type = event.constructor.name;

    const data = jsonEvent({
      type,
      data: message,
    });

    await this.esRepository.appendToStream(streamName, data);
  }

  async getAllEvents(): Promise<AllStreamRecordedEvent[]> {
    const result = await this.esRepository.readAll();
    return result;
  }

  async getStream(streamName: string): Promise<ResolvedEvent<EventType>[]> {
    const result = await this.esRepository.readStream(streamName);
    return result;
  }

  async createPersistentSubscription() {
    try {
      await this.esRepository.createPersistentSubscriptionToAll();

      console.log('Persistent subscription created successfully');
    } catch (err) {
      console.error('Error creating persistent subscription:', err);
    }
  }

  async readFromPersistentSubscription() {
    const subscription =
      await this.esRepository.subscribeToPersistentSubscriptionToAll();

    subscription.on('data', (resolvedEvent) => {
      if (resolvedEvent.event.type.startsWith('$')) {
        return;
      }
      console.log('** Received event');
      this.handleEvent(resolvedEvent.event);
    });
    subscription.on('error', (err) => {
      console.error('Error in persistent subscription:', err);
    });
    subscription.on('end', () => {
      console.error('end in persistent subscription');
    });
    subscription.on('close', () => {
      console.error('close in persistent subscription');
    });
  }

  private async handleEvent(recievedEvent: any) {
    // return recievedEvent;
    const event = this.eventHandler(recievedEvent);
    await this.eventBus.publish(event);
  }

  async loadEvents(streamName: string): Promise<any[]> {
    const events = [];
    const eventStream = await this.esRepository.readStream(streamName);

    for (const resolvedEvent of eventStream) {
      const event = this.eventHandler(resolvedEvent);
      events.push(event);
    }
    return events;
  }

  eventHandler(recievedEvent) {
    let event: ContactCreated | ContactUpdated;
    switch (recievedEvent.type) {
      case 'ContactCreated':
        event = new ContactCreated(
          recievedEvent.data.id,
          recievedEvent.data.name,
          recievedEvent.data.phoneNumber,
        );
        break;
      case 'ContactUpdated':
        event = new ContactUpdated(
          recievedEvent.data.id,
          recievedEvent.data.name,
        );
        break;
    }

    return event;
  }
}
