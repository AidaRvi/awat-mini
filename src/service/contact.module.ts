import { Module } from '@nestjs/common';
// import { ContactCreatedEventHandler } from './handler/contact.event.handler';
import { ContactService } from './contact.service';
import { ContactRepository } from 'src/infrustructure/storage/eventstoredb/contact.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateContactHandler } from './handler/contact.command.handler';
import { EventstoreRepository } from 'src/infrustructure/storage/eventstoredb/eventstoredb.repository';

@Module({
  imports: [CqrsModule],
  providers: [
    EventstoreRepository,
    ContactRepository,
    CreateContactHandler,
    ContactService,
    // ContactCreatedEventHandler,
  ],
  exports: [ContactService],
})
export class ContactModule {}
