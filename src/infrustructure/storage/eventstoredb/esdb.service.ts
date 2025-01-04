/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { IEvent, IEventPublisher, EventBus } from '@nestjs/cqrs';
import {
  AllStreamRecordedEvent,
  EventStoreDBClient,
  EventType,
  jsonEvent,
  PersistentSubscriptionToAllSettings,
  ROUND_ROBIN,
  START,
  ResolvedEvent,
} from '@eventstore/db-client';
import { ContactCreated } from 'src/domain/events/create-contact.event';
import { CreateContactEventHandler } from 'src/service/handler/create-contact.event.handler';
import { UpdateContactEventHandler } from 'src/service/handler/update-contact.event.handler';
import { ContactUpdated } from 'src/domain/events/update-contact.event';

@Injectable()
export class EventStoreService implements IEventPublisher, OnModuleInit {
  private client: EventStoreDBClient;
  private subscriptionName = 'CONTACTS2';

  constructor(private readonly eventBus: EventBus) {}

  onModuleInit() {
    this.client = EventStoreDBClient.connectionString(
      'esdb://localhost:2114?tls=false',
    );
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

    try {
      await this.client.appendToStream(streamName, data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      console.log('error in appending to stream');
    }
  }

  async getAllEvents(): Promise<AllStreamRecordedEvent[]> {
    const result: any[] = [];
    const readResult = this.client.readAll();

    for await (const resolvedEvent of readResult)
      result.push(resolvedEvent.event);

    return result;
  }

  async getStream(streamName: string): Promise<ResolvedEvent<EventType>[]> {
    try {
      const unResolvedEvent = this.client.readStream(streamName, {
        fromRevision: START,
      });

      const events = [];
      for await (const resolvedEvent of unResolvedEvent)
        events.push(resolvedEvent.event);

      return events;
    } catch (error) {
      return [];
    }
  }

  async createProjection() {
    try {
      const projectionName = 'projectionName10';

      const query = `
        fromCategory('contacts')
        .when({
          $init: () => ({ events: [] }),
            ContactCreated: (state, event) => {
            state.events.push({
              id: event.data.id,
              name: event.data.name,
              phoneNumber: event.data.phoneNumber,
            });
            return state;
          }
        })
      `;

      await this.client.createProjection(projectionName, query, {
        emitEnabled: true,
      });

      console.log('Projection created successfully');
    } catch (err) {
      console.error('Error creating projection:', err);
    }
  }

  async createPersistentSubscription() {
    try {
      const settings: PersistentSubscriptionToAllSettings = {
        startFrom: 'start',
        resolveLinkTos: false,
        extraStatistics: false,
        messageTimeout: 0,
        maxRetryCount: 0,
        checkPointAfter: 0,
        checkPointLowerBound: 0,
        checkPointUpperBound: 0,
        maxSubscriberCount: 2,
        liveBufferSize: 900,
        readBatchSize: 900,
        historyBufferSize: 1000,
        consumerStrategyName: ROUND_ROBIN,
      };

      await this.client.createPersistentSubscriptionToAll(
        this.subscriptionName,
        settings,
      );

      console.log('Persistent subscription created successfully');
    } catch (err) {
      console.error('Error creating persistent subscription:', err);
    }
  }

  async readFromPersistentSubscription() {
    const subscription = this.client.subscribeToPersistentSubscriptionToAll(
      this.subscriptionName,
    );
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
    let event;

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

    await this.eventBus.publish(event);
  }
}
