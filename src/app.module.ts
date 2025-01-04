import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventStoreModule } from './infrustructure/storage/eventstoredb/esdb.module';
import { ContactModule } from './service/contact.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controllers/app.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { RedisModule } from './infrustructure/storage/redis/redis.module';
import { RabbitmqController } from './controllers/rmq.controller';

@Module({
  imports: [
    RedisModule,
    CqrsModule,
    EventStoreModule,
    ContactModule,
    MongooseModule.forRoot('mongodb://localhost:27017/awat-test'),
  ],
  exports: [EventStoreModule],
  controllers: [AppController, SubscriptionController, RabbitmqController],
})
export class AppModule {}
