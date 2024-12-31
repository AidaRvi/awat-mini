import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventStoreModule } from './infrustructure/storage/eventstoredb/esdb.module';
import { ContactModule } from './service/contact.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controllers/app.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { ConsumerService } from './service/consumer.service';

@Module({
  imports: [
    CqrsModule,
    EventStoreModule,
    ContactModule,
    MongooseModule.forRoot('mongodb://localhost:27017/awat'),
  ],
  // controllers: [AppController, ConsumerService],
  controllers: [AppController, SubscriptionController, ConsumerService],
})
export class AppModule {}
