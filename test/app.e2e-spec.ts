import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RabbitmqController } from 'src/controllers/rmq.controller';
import { CreateContactDto } from 'src/domain/Dto/create-contact.dto';
import { faker } from '@faker-js/faker/.';
import { v4 as uuidv4 } from 'uuid';
import { mockRedisService } from './mockes/redis.mock';
import { mockEventStoreRepository } from './mockes/esdb.mock';
import { MockedContactRepository } from './mockes/mongo.mock';
import { RedisService } from 'src/infrustructure/storage/redis/redis.service';
import { EventStoreRepository } from 'src/infrustructure/storage/eventstoredb/esdb.repository';
import { ContactRepository } from 'src/infrustructure/storage/mongodb/contact.repository';
import { AppModule } from 'src/app.module';

describe('ContactModule (e2e)', () => {
  let app: INestApplication;
  let rmqController: RabbitmqController;
  let redisService: mockRedisService;
  let eventStoreRepository: mockEventStoreRepository;
  let contactRepository: MockedContactRepository;

  beforeAll(async () => {
    console.log(mockEventStoreRepository.getInstanceCount());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useClass(mockRedisService)
      .overrideProvider(EventStoreRepository)
      .useClass(mockEventStoreRepository)
      .overrideProvider(ContactRepository)
      .useClass(MockedContactRepository)
      .compile();

    console.log(mockEventStoreRepository.getInstanceCount());

    app = moduleFixture.createNestApplication();
    await app.init();

    rmqController = app.get(RabbitmqController);
    redisService = app.get(RedisService);
    eventStoreRepository = app.get(EventStoreRepository);
    contactRepository = app.get(ContactRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create contact', async () => {
    const message: CreateContactDto = {
      id: uuidv4(),
      name: faker.person.firstName(),
      phoneNumber: Number(
        faker.phone.number({ style: 'international' }).slice(1),
      ),
    };

    await rmqController.createContact(message);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const esdbData = eventStoreRepository.readStream(`contacts-${message.id}`);
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(1);
    expect(esdbData[0].type).toBe('ContactCreated');

    const redisData = redisService.getData(`create:${message.id}`);
    expect(redisData).toBeDefined();
    expect(redisData).toBe('completed');

    const mongoData = contactRepository.findOne(message.id);
    expect(mongoData).toBeDefined();
    expect(mongoData.name).toBe(message.name);
  }, 20000);
});
