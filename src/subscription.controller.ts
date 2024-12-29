import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { EventStoreService } from './infrustructure/storage/eventstoredb/esdb.service';

@Controller()
export class SubscriptionController implements OnModuleInit {
  constructor(private readonly eventStoreService: EventStoreService) {}

  @Get('create-persistent-subscription')
  async createSubscription() {
    // await this.eventStoreService.createProjection();
    await this.eventStoreService.createPersistentSubscription();
    this.eventStoreService.readFromPersistentSubscription();
    return 'Persistent Subscription Started';
  }

  async onModuleInit() {
    this.createSubscription();
  }
}
