import { Module } from '@nestjs/common';
import { EventstoreRepository } from './eventstoredb.repository';
import { SubscriptionController } from './subscription.controller';

@Module({
  providers: [EventstoreRepository],
  controllers: [SubscriptionController],
  exports: [EventstoreRepository],
})
export class EventStoreModule {}
