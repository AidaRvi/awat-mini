import { Injectable } from '@nestjs/common';
import {
  AllStreamRecordedEvent,
  EventStoreDBClient,
  EventType,
  START,
  ResolvedEvent,
  persistentSubscriptionToStreamSettingsFromDefaults,
} from '@eventstore/db-client';

@Injectable()
export class EventStoreRepository {
  private client: EventStoreDBClient;
  private subscriptionName = 'contacts';
  private streamName = '$et-ContactCreated';
  private subscriptionNameUpdate = 'contactsUpdate';
  private streamNameUpdate = '$et-ContactUpdated';

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
        this.streamNameUpdate,
        this.subscriptionNameUpdate,
        persistentSubscriptionToStreamSettingsFromDefaults({
          resolveLinkTos: true,
          startFrom: BigInt(0),
          checkPointLowerBound: 1,
        }),
      );
      await this.client.createPersistentSubscriptionToStream(
        this.streamName,
        this.subscriptionName,
        persistentSubscriptionToStreamSettingsFromDefaults({
          resolveLinkTos: true,
          startFrom: BigInt(0),
          checkPointLowerBound: 1,
        }),
      );

      console.log('Persistent subscription created successfully');
    } catch (err) {
      console.error('Error creating persistent subscription:', err.message);
    }
  }

  async subscribeToPersistentSubscriptionToStream() {
    const subscription = this.client.subscribeToPersistentSubscriptionToStream(
      this.streamName,
      this.subscriptionName,
    );

    return subscription;
  }

  async subscribeToPersistentSubscriptionToStreamUpdate() {
    const subscription = this.client.subscribeToPersistentSubscriptionToStream(
      this.streamNameUpdate,
      this.subscriptionNameUpdate,
    );

    return subscription;
  }
}
