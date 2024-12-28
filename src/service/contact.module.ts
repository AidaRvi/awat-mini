import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { CreateContactHandler } from './handler/contact.command.handler';
import { EventstoreRepository } from 'src/infrustructure/storage/eventstoredb/eventstoredb.repository';
import { ContactRoot } from 'src/domain/models/contact.model';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';

@Module({
  imports: [CqrsModule],
  providers: [
    EventstoreRepository,
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
