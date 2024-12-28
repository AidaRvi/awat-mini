import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { EventStoreService } from './esdb.service';
import { EventstoreRepository } from './eventstoredb.repository';

@Module({
  providers: [EventStoreService, EventstoreRepository],
  controllers: [SubscriptionController],
  exports: [EventstoreRepository],
})
export class EventStoreModule {}
