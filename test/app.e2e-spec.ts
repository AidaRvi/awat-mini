import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ContactModule } from 'src/service/contact.module';
import { RabbitmqController } from 'src/controllers/rmq.controller';
import { CreateContactDto } from 'src/domain/Dto/create-contact.dto';
import { faker } from '@faker-js/faker/.';
import { v4 as uuidv4 } from 'uuid';
import { mockRedisService } from './mockes/redis.mock';
import { mockEventStoreRepository } from './mockes/esdb.mock';
import { mockContactModel } from './mockes/mongo.mock';
import { RedisService } from 'src/infrustructure/storage/redis/redis.service';
import { SubscriptionController } from 'src/controllers/subscription.controller';
import { EventStoreRepository } from 'src/infrustructure/storage/eventstoredb/esdb.repository';
import { EventStoreModule } from 'src/infrustructure/storage/eventstoredb/esdb.module';
import { CreateContactEventHandler } from 'src/service/handler/create-contact.event.handler';
import { UpdateContactEventHandler } from 'src/service/handler/update-contact.event.handler';
import { ContactRepository } from 'src/infrustructure/storage/mongodb/contact.repository';
import { AppModule } from 'src/app.module';
import { ContactService } from 'src/service/contact.service';
import { CommandBus } from '@nestjs/cqrs';

describe('ContactModule (e2e)', () => {
  let app: INestApplication;
  let rmqController: RabbitmqController;
  let redisService: mockRedisService;
  let eventStoreRepository: mockEventStoreRepository;
  let contactModel: mockContactModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        // CreateContactEventHandler,
        // UpdateContactEventHandler,
        // ContactRepository,
        // RedisService,
        ContactService,
        CommandBus,
      ],
      controllers: [RabbitmqController],
    })
      .overrideProvider(RedisService)
      .useClass(mockRedisService)
      .overrideProvider(EventStoreRepository)
      .useClass(mockEventStoreRepository)
      .overrideProvider(getModelToken('Contact'))
      .useClass(mockContactModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    rmqController = app.get(RabbitmqController);
    redisService = app.get(RedisService);
    eventStoreRepository = app.get(EventStoreRepository);
    contactModel = app.get(getModelToken('Contact'));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should consume a RabbitMQ message and process it correctly', async () => {
    const message: CreateContactDto = {
      id: uuidv4(),
      name: faker.person.firstName(),
      phoneNumber: Number(
        faker.phone.number({ style: 'international' }).slice(1),
      ),
    };

    await rmqController.createContact(message);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const redisData = redisService.getData(`create:${message.id}`);
    expect(redisData).toBeDefined();
    expect(redisData).toBe('published');

    const esdbData = eventStoreRepository.readStream(`contacts-${message.id}`);
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(1);
    expect(esdbData[0].type).toBe('ContactCreated');
  }, 20000);
});
