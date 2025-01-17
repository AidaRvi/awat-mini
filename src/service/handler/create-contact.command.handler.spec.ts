import { Test, TestingModule } from '@nestjs/testing';
import { CreateContactCommand } from 'src/domain/commands/create-contact.command';
import { EventStoreService } from 'src/infrustructure/storage/eventstoredb/esdb.service';
import { RedisService } from 'src/infrustructure/storage/redis/redis.service';
import { EventPublisher } from '@nestjs/cqrs';
import { CreateContactHandler } from './create-contact.command.handler';
import {
  AllStreamRecordedEvent,
  EventType,
  ResolvedEvent,
} from '@eventstore/db-client';

describe('CreateContactHandler', () => {
  let handler: CreateContactHandler;
  let eventStoreService: jest.Mocked<EventStoreService>;
  let redisService: jest.Mocked<RedisService>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateContactHandler,
        {
          provide: EventStoreService,
          useValue: {
            getStream: jest.fn(),
            getAllEvents: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            setData: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            mergeObjectContext: jest.fn().mockImplementation((aggregate) => ({
              ...aggregate,
              commit: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateContactHandler>(CreateContactHandler);
    eventStoreService = module.get(EventStoreService);
    redisService = module.get(RedisService);
    eventPublisher = module.get(EventPublisher);
  });

  it('should create a contact successfully', async () => {
    const command = new CreateContactCommand(
      'contactId',
      'Aida',
      1234567890,
      'correlationId',
    );
    eventStoreService.getStream.mockResolvedValue([]);
    eventStoreService.getAllEvents.mockResolvedValue([]);
    redisService.setData.mockResolvedValue(undefined);

    await handler.execute(command);

    expect(eventStoreService.getStream).toHaveBeenCalledWith(
      `contacts-${command.id}`,
    );
    expect(eventStoreService.getAllEvents).toHaveBeenCalled();
    expect(eventPublisher.mergeObjectContext).toHaveBeenCalled();
    expect(redisService.setData).toHaveBeenCalledWith(
      command.correlationId,
      'published',
    );
  });

  it('should fail if the contact already exists', async () => {
    const command = new CreateContactCommand(
      'contactId',
      'Aida',
      1234567890,
      'correlationId',
    );

    const data: ResolvedEvent<EventType> = {};
    eventStoreService.getStream.mockResolvedValue([data]);
    eventStoreService.getAllEvents.mockResolvedValue([]);
    redisService.setData.mockResolvedValue(undefined);

    await expect(handler.execute(command)).rejects.toThrow('Contact exists');

    expect(redisService.setData).toHaveBeenCalledWith(
      'correlationId',
      'failed',
    );
    expect(eventPublisher.mergeObjectContext).not.toHaveBeenCalled();
  });

  it('should fail if the phone number is already in use', async () => {
    const command = new CreateContactCommand(
      'contactId',
      'Aida',
      1234567890,
      'correlationId',
    );

    eventStoreService.getStream.mockResolvedValue([]);

    //@ts-ignore
    const data: AllStreamRecordedEvent = {
      streamId: '',
      id: 'string',
      isJson: true,
      type: 'ContactCreated',
      created: new Date(),
      data: { phoneNumber: 1234567890 },
      metadata: {},
    };
    eventStoreService.getAllEvents.mockResolvedValue([data]);
    redisService.setData.mockResolvedValue(undefined);

    await expect(handler.execute(command)).rejects.toThrow(
      'Duplicated PhoneNumber entered',
    );

    expect(redisService.setData).toHaveBeenCalledWith(
      `correlationId`,
      'failed',
    );
    expect(eventPublisher.mergeObjectContext).not.toHaveBeenCalled();
  });
});
