import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { EventStoreModule } from './infrustructure/storage/eventstoredb/eventstoredb.module';
import { ContactModule } from './service/contact.module';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [CqrsModule, EventStoreModule, ContactModule],
  controllers: [AppController, SubscriptionController],
})
export class AppModule {}
