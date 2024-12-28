import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IEvent, IEventPublisher } from '@nestjs/cqrs';
import {
  AllStreamRecordedEvent,
  EventStoreDBClient,
  jsonEvent,
  PersistentSubscriptionToStream,
  PersistentSubscriptionToStreamSettings,
} from '@eventstore/db-client';

@Injectable()
export class EventStoreService implements IEventPublisher, OnModuleInit {
  private client: EventStoreDBClient;
  private subscription: PersistentSubscriptionToStream;

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
    const result: any[] = [];
    const readResult = this.client.readAll();

    for await (const resolvedEvent of readResult)
      result.push(resolvedEvent.event);

    return result;
  }

  async createProjection() {
    try {
      const projectionName = 'contact-created';

      const query = `
        fromAll()
        .when({
          $init: () => ({ events: [] }),
          ContactCreated: (state, event) => {
            state.events.push(event.data);
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
      const subscriptionName = 'contacts-subscription';

      const settings: PersistentSubscriptionToStreamSettings = {
        resolveLinkTos: true,
        maxRetryCount: 5,
        messageTimeout: 5000,
        extraStatistics: false,
        checkPointAfter: 0,
        checkPointLowerBound: 0,
        checkPointUpperBound: 0,
        maxSubscriberCount: 0,
        liveBufferSize: 0,
        readBatchSize: 0,
        historyBufferSize: 1000,
        consumerStrategyName: '',
        startFrom: 0n,
      };

      await this.client.createPersistentSubscriptionToStream(
        '$-contact-created',
        subscriptionName,
        settings,
      );

      console.log('Persistent subscription created successfully');
    } catch (err) {
      console.error('Error creating persistent subscription:', err);
    }
  }

  async readFromPersistentSubscription() {
    const subscriptionName = 'contacts-subscription';

    const subscription = this.client.subscribeToPersistentSubscriptionToStream(
      '$et-ContactCreated',
      subscriptionName,
    );

    subscription.on('data', (resolvedEvent) => {
      console.log('Received event:', resolvedEvent.event);
    });
    subscription.on('error', (err) => {
      console.error('Error in persistent subscription:', err);
    });
  }
}
