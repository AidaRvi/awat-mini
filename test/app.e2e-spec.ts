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
import { UpdateContactDto } from 'src/domain/Dto/update-contact.dto';
import { SubscriptionController } from 'src/controllers/subscription.controller';

describe('ContactModule (e2e)', () => {
  let app: INestApplication;
  let rmqController: RabbitmqController;
  let subscriptionController: SubscriptionController;
  let redisService: mockRedisService;
  let eventStoreRepository: mockEventStoreRepository;
  let contactRepository: MockedContactRepository;
  const firstContact: CreateContactDto = {
    id: uuidv4(),
    name: faker.person.firstName(),
    phoneNumber: Number(
      faker.phone.number({ style: 'international' }).slice(1),
    ),
  };

  beforeAll(async () => {
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
    app = moduleFixture.createNestApplication();
    await app.init();

    rmqController = app.get(RabbitmqController);
    redisService = app.get(RedisService);
    eventStoreRepository = app.get(EventStoreRepository);
    contactRepository = app.get(ContactRepository);
    subscriptionController = app.get(SubscriptionController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create contact', async () => {
    await rmqController.createContact(firstContact);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const esdbData = eventStoreRepository.readStream(
      `contacts-${firstContact.id}`,
    );
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(1);
    expect(esdbData[0].type).toBe('ContactCreated');

    const redisData = redisService.getData(`create:${firstContact.id}`);
    expect(redisData).toBeDefined();
    expect(redisData).toBe('completed');

    const mongoData = contactRepository.findOne(firstContact.id);
    expect(mongoData).toBeDefined();
    expect(mongoData.name).toBe(firstContact.name);
  });

  it('should not be able to create the same contact', async () => {
    await rmqController.createContact(firstContact);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const esdbData = eventStoreRepository.readStream(
      `contacts-${firstContact.id}`,
    );
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(1);
    expect(esdbData[0].type).toBe('ContactCreated');

    const redisData = redisService.getData(`create:${firstContact.id}`);
    expect(redisData).toBeDefined();
    expect(redisData).toBe('failed');
  });

  it('should update the contact', async () => {
    const updateDTO: UpdateContactDto = {
      id: firstContact.id,
      name: faker.person.firstName(),
    };
    rmqController.updateContact(updateDTO);
    subscriptionController.createSubscription();

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const esdbData = eventStoreRepository.readStream(
      `contacts-${updateDTO.id}`,
    );
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(2);
    expect(esdbData[0].type).toBe('ContactCreated');
    expect(esdbData[1].type).toBe('ContactUpdated');

    const redisData = redisService.getData(`update:${updateDTO.id}`);
    expect(redisData).toBeDefined();
    expect(redisData).toBe('completed');

    const mongoData = contactRepository.findOne(updateDTO.id);
    expect(mongoData).toBeDefined();
    expect(mongoData.name).toBe(updateDTO.name);
  }, 10000);
});
