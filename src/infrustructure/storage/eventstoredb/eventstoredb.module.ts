import { Module } from '@nestjs/common';
import { EventStoreService } from './esdb.service';

@Module({
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventStoreModule {}
