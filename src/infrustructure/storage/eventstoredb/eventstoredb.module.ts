import { Module } from '@nestjs/common';
import { EventStoreService } from './esdb.service';
import { CommandBus, EventBus, UnhandledExceptionBus } from '@nestjs/cqrs';
import { ContactRepository } from '../mongodb/contact.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from '../mongodb/contact.schema';
import { CreateContactEventHandler } from 'src/service/handler/contact.event.handler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
  ],
  providers: [
    EventStoreService,
    CreateContactEventHandler,
    EventBus,
    ContactRepository,
    CommandBus,
    UnhandledExceptionBus,
  ],
  exports: [EventStoreService],
})
export class EventStoreModule {}
