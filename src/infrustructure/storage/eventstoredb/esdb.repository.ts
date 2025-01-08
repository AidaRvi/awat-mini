import { Injectable } from '@nestjs/common';
import {
  AllStreamRecordedEvent,
  EventStoreDBClient,
  EventType,
  ROUND_ROBIN,
  START,
  ResolvedEvent,
  PersistentSubscriptionToStreamSettings,
  persistentSubscriptionToStreamSettingsFromDefaults,
} from '@eventstore/db-client';

@Injectable()
export class EventStoreRepository {
  private client: EventStoreDBClient;
  private subscriptionName = 'con52tact-gr3155347';
  private streamName = '$et-ContactCreated';

  private setting: any = {
    checkPointLowerBound: 1,
    resolveLinkTos: true,
    startFrom: BigInt(0),
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

  async createPersistentSubscriptionToStream() {
    try {
      await this.client.createPersistentSubscriptionToStream(
        this.streamName,
        this.subscriptionName,
        persistentSubscriptionToStreamSettingsFromDefaults(this.setting),
      );

      console.log('Persistent subscription created successfully');
    } catch (err) {
      console.error('Error creating persistent subscription:', err);
    }
  }

  async subscribeToPersistentSubscriptionToStream() {
    const subscription = this.client.subscribeToPersistentSubscriptionToStream(
      this.streamName,
      this.subscriptionName,
    );

    return subscription;
  }
}
