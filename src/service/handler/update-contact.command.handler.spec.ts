import { Test, TestingModule } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { ContactCreated } from '../../domain/events/create-contact.event';
import { ContactUpdated } from '../../domain/events/update-contact.event';
import { Contact } from '../../domain/models/contact.model';
import { UpdateContactCommand } from '../../domain/commands/update-contact.command';
import { UpdateContactHandler } from './update-contact.command.handler';
import { RedisService } from '../../infrustructure/storage/redis/redis.service';
import { EventStoreService } from '../../infrustructure/storage/eventstoredb/esdb.service';

describe.only('UpdateContactHandler', () => {
  let commandHandler: UpdateContactHandler;
  let eventStoreMock: jest.Mocked<EventStoreService>;
  let redisServiceMock: jest.Mocked<RedisService>;
  let publisherMock: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateContactHandler,
        {
          provide: EventStoreService,
          useValue: { loadEvents: jest.fn() },
        },
        {
          provide: RedisService,
          useValue: { setData: jest.fn() },
        },
        {
          provide: EventPublisher,
          useValue: { mergeObjectContext: jest.fn((aggregate) => aggregate) },
        },
      ],
    }).compile();

    commandHandler = module.get<UpdateContactHandler>(UpdateContactHandler);
    eventStoreMock = module.get(EventStoreService);
    redisServiceMock = module.get(RedisService);
    publisherMock = module.get(EventPublisher);
  });

  it('should successfully update a contact', async () => {
    const mockContact = new Contact();
    mockContact.createContact('uuid', 'Aida', 9389837511);
    mockContact.commit();

    eventStoreMock.loadEvents.mockResolvedValueOnce([
      new ContactCreated('uuid', 'Aida', 9389837511),
    ]);

    const command = new UpdateContactCommand('uuid', 'Azin');
    await commandHandler.execute(command);

    expect(eventStoreMock.loadEvents).toHaveBeenCalledWith('contacts-uuid');
    expect(redisServiceMock.setData).toHaveBeenCalledWith(
      'update:uuid',
      'published',
    );
  });

  it('should not update a contact which is not created before', async () => {
    eventStoreMock.loadEvents.mockResolvedValueOnce([]);

    const command = new UpdateContactCommand('uuid', 'Azin');
    await commandHandler.execute(command);

    expect(eventStoreMock.loadEvents).toHaveBeenCalledWith('contacts-uuid');
    expect(redisServiceMock.setData).toHaveBeenCalledWith(
      'update:uuid',
      'failed',
    );
  });

  it('should set a failed state in Redis when update limit is exceeded', async () => {
    const mockContact = new Contact();
    mockContact.createContact('uuid', 'Aida', 9389837511);

    for (let i = 0; i < 5; i++) {
      mockContact.updateContact(`Aida ${i}`);
    }

    eventStoreMock.loadEvents.mockResolvedValueOnce([
      new ContactCreated('uuid', 'Aida', 9389837511),
      ...Array(5).fill(new ContactUpdated('uuid', 'Aida')),
    ]);

    const command = new UpdateContactCommand('uuid', 'Aida 6');
    await commandHandler.execute(command);

    expect(redisServiceMock.setData).toHaveBeenCalledWith(
      'update:uuid',
      'failed',
    );
  });
});
