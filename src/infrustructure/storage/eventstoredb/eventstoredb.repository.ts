import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import {
  EventStoreDBClient,
  jsonEvent,
  START,
  PersistentSubscriptionToStream,
  PersistentSubscriptionToStreamSettings,
  AllStreamRecordedEvent,
} from '@eventstore/db-client';

@Injectable()
export class EventstoreRepository implements OnModuleInit {
  private client: EventStoreDBClient;
  private subscription: PersistentSubscriptionToStream;

  onModuleInit() {
    this.client = EventStoreDBClient.connectionString(
      'esdb://localhost:2113?tls=false',
    );
  }

  async writeEvent(streamName: string, eventType: string, data: any) {
    try {
      const event = jsonEvent({
        type: eventType,
        data: data,
      });
      await this.client.appendToStream(streamName, event);
    } catch (error) {
      console.log(error);
    }
  }

  async readEvents(streamName: string, maxCount: number = 10) {
    try {
      const events = this.client.readStream(streamName, {
        fromRevision: START,
        maxCount: maxCount,
      });
      return events;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async createPersistentSubscription(
    streamName: string,
    subscriptionGroup: string,
  ) {
    const settings: PersistentSubscriptionToStreamSettings = {
      extraStatistics: false,
      messageTimeout: 20000,
      maxRetryCount: 10,
      liveBufferSize: 500,
      historyBufferSize: 1000,
      readBatchSize: 10,
      startFrom: START,
      consumerStrategyName: '',
      resolveLinkTos: false,
      checkPointAfter: 0,
      checkPointLowerBound: 0,
      checkPointUpperBound: 0,
      maxSubscriberCount: 0,
    };

    try {
      await this.client.createPersistentSubscriptionToStream(
        streamName,
        subscriptionGroup,
        settings,
      );
      console.log(
        `Persistent subscription created for stream ${streamName} and group ${subscriptionGroup}`,
      );
    } catch (error) {
      console.error('Error creating persistent subscription:', error);
    }
  }

  async startPersistentSubscription(
    streamName: string,
    subscriptionGroup: string,
  ) {
    this.subscription = this.client.subscribeToPersistentSubscriptionToStream(
      streamName,
      subscriptionGroup,
    );

    this.subscription.on('data', async (resolvedEvent) => {
      console.log(`Received event: ${resolvedEvent.event.type}`);

      await this.processEvent(resolvedEvent);

      this.subscription.ack(resolvedEvent);
    });

    this.subscription.on('error', (error) => {
      console.error('Error in persistent subscription:', error);
    });

    this.subscription.on('close', () => {
      console.log('Persistent subscription closed');
    });

    this.subscription.on('connected', () => {
      console.log('Persistent subscription connected');
    });
  }

  private async processEvent(resolvedEvent: any) {
    console.log('Processing event:', resolvedEvent.event.data);
  }

  async getAllEvents(): Promise<AllStreamRecordedEvent[]> {
    const events: any[] = [];

    try {
      const readResult = this.client.readAll();

      for await (const resolvedEvent of readResult)
        events.push(resolvedEvent.event);

      return events;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error retrieving projection events',
        error.message,
      );
    }
  }
}
