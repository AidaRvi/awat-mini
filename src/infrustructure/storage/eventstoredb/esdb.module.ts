import { Module } from '@nestjs/common';
import { EventStoreService } from './esdb.service';
import { CommandBus, EventBus, UnhandledExceptionBus } from '@nestjs/cqrs';
import { ContactRepository } from '../mongodb/contact.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from '../mongodb/contact.schema';
import { CreateContactEventHandler } from 'src/service/handler/create-contact.event.handler';
import { UpdateContactEventHandler } from 'src/service/handler/update-contact.event.handler';
import { RedisModule } from '../redis/redis.module';
import { EventStoreRepository } from './esdb.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
    RedisModule,
  ],
  providers: [
    EventStoreService,
    EventStoreRepository,
    CreateContactEventHandler,
    UpdateContactEventHandler,
    EventBus,
    ContactRepository,
    CommandBus,
    UnhandledExceptionBus,
  ],
  exports: [EventStoreService, EventStoreRepository],
})
export class EventStoreModule {}
