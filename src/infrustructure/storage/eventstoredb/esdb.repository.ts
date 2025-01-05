import { Injectable } from '@nestjs/common';
import {
  AllStreamRecordedEvent,
  EventStoreDBClient,
  EventType,
  PersistentSubscriptionToAllSettings,
  ROUND_ROBIN,
  START,
  ResolvedEvent,
} from '@eventstore/db-client';

@Injectable()
export class EventStoreRepository {
  private client: EventStoreDBClient;
  private subscriptionName = 'CONTACTS2';
  private setting: PersistentSubscriptionToAllSettings = {
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

  constructor() {}

  onModuleInit() {
    this.client = EventStoreDBClient.connectionString(
      'esdb://localhost:2113?tls=false',
    );
  }

  async appendToStream(streamName: string, data: any) {
    try {
      await this.client.appendToStream(streamName, data);
    } catch (err) {
      console.log('error in appending to stream');
    }
  }

  async readAll(): Promise<AllStreamRecordedEvent[]> {
    const result: any[] = [];
    const readResult = this.client.readAll();

    for await (const resolvedEvent of readResult)
      result.push(resolvedEvent.event);

    return result;
  }

  async readStream(streamName: string): Promise<ResolvedEvent<EventType>[]> {
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

  async createPersistentSubscriptionToAll() {
    try {
      await this.client.createPersistentSubscriptionToAll(
        this.subscriptionName,
        this.setting,
      );

      console.log('Persistent subscription created successfully');
    } catch (err) {
      console.error('Error creating persistent subscription:', err);
    }
  }

  async subscribeToPersistentSubscriptionToAll() {
    const subscription = this.client.subscribeToPersistentSubscriptionToAll(
      this.subscriptionName,
    );

    return subscription;
  }
}
