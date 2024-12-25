import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { EventstoreRepository } from './eventstoredb.repository';

@Controller()
export class SubscriptionController implements OnModuleInit {
  constructor(private readonly eventStoreService: EventstoreRepository) {}

  @Get('create-persistent-subscription')
  async createSubscription() {
    console.log('CONTROLLER');
    const streamName = 'contact';
    const subscriptionGroup = 'contact-group';
    await this.eventStoreService.createPersistentSubscription(
      streamName,
      subscriptionGroup,
    );
    await this.eventStoreService.startPersistentSubscription(
      streamName,
      subscriptionGroup,
    );
    return 'Persistent Subscription Started';
  }

  onModuleInit() {
    this.createSubscription();
  }
}
