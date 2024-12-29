import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { CreateContactHandler } from './handler/contact.command.handler';
import { ContactRoot } from 'src/domain/models/contact.model';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Contact,
  ContactSchema,
} from 'src/infrustructure/storage/mongodb/contact.schema';
import { ContactRepository } from 'src/infrustructure/storage/mongodb/contact.repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
  ],
  providers: [
    ContactRepository,
    CreateContactHandler,
    ContactService,
    ContactRoot,
    EventStoreService,
  ],
  exports: [ContactService],
})
export class ContactModule {
  constructor(
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.eventBus.publisher = this.eventStore;
  }
}
