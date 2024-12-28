import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { EventStoreService } from './infrustructure/storage/eventstoredb/esdb.service';

@Controller()
export class SubscriptionController implements OnModuleInit {
  constructor(private readonly eventStoreService: EventStoreService) {}

  @Get('create-persistent-subscription')
  async createSubscription() {
    return 'Persistent Subscription Started';
  }

  async onModuleInit() {
    // await this.eventStoreService.createPersistentSubscription();
    await this.eventStoreService.readFromPersistentSubscription();
    this.createSubscription();
  }
}
