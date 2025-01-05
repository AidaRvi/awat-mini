import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { CreateContactHandler } from './handler/create-contact.command.handler';
import { Contact } from 'src/domain/models/contact.model';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Contact as ContactModel,
  ContactSchema,
} from 'src/infrustructure/storage/mongodb/contact.schema';
import { UpdateContactHandler } from './handler/update-contact.command.handler';
import { RedisModule } from 'src/infrustructure/storage/redis/redis.module';
import { EventStoreModule } from 'src/infrustructure/storage/eventstoredb/esdb.module';

@Module({
  imports: [
    RedisModule,
    CqrsModule,
    EventStoreModule,
    MongooseModule.forFeature([
      { name: ContactModel.name, schema: ContactSchema },
    ]),
  ],
  providers: [
    CreateContactHandler,
    UpdateContactHandler,
    ContactService,
    Contact,
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
