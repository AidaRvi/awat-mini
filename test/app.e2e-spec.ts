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
    correlationId: uuidv4(),
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

  const pollRedis = async (
    key: string,
    condition: (value: string) => boolean,
  ) => {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkCondition = async () => {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime > 4000)
          return reject(new Error('Polling timeout reached'));

        const value = await redisService.getData(key);
        if (condition(value)) return resolve(value);

        setTimeout(checkCondition, 500);
      };

      checkCondition();
    });
  };

  it('should create contact', async () => {
    await rmqController.createContact(firstContact);

    await pollRedis(
      firstContact.correlationId,
      (value) => value === 'completed',
    );

    const esdbData = eventStoreRepository.readStream(
      `contacts-${firstContact.id}`,
    );
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(1);
    expect(esdbData[0].type).toBe('ContactCreated');
    expect(esdbData[0].data.correlationId).toBe(firstContact.correlationId);

    const mongoData = contactRepository.findOne(firstContact.id);
    expect(mongoData).toBeDefined();
    expect(mongoData.name).toBe(firstContact.name);
  });

  it('should not be able to create the same contact', async () => {
    const dublicatedContact: CreateContactDto = {
      id: firstContact.id,
      correlationId: uuidv4(),
      name: firstContact.name,
      phoneNumber: firstContact.phoneNumber,
    };
    await rmqController.createContact(dublicatedContact); // TODO: error

    await pollRedis(
      dublicatedContact.correlationId,
      (value) => value === 'failed',
    );

    const esdbData = eventStoreRepository.readStream(
      `contacts-${dublicatedContact.id}`,
    );
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(1);
    expect(esdbData[0].type).toBe('ContactCreated');
  });

  it('should update the contact', async () => {
    const updateDTO: UpdateContactDto = {
      id: firstContact.id,
      name: faker.person.firstName(),
      correlationId: uuidv4(),
    };
    await rmqController.updateContact(updateDTO);
    await subscriptionController.createSubscription();

    await pollRedis(updateDTO.correlationId, (value) => value === 'completed');
    const esdbData = eventStoreRepository.readStream(
      `contacts-${updateDTO.id}`,
    );
    expect(esdbData).toBeDefined();
    expect(esdbData.length).toBe(2);
    expect(esdbData[0].type).toBe('ContactCreated');
    expect(esdbData[1].type).toBe('ContactUpdated');
    expect(esdbData[1].data.correlationId).toBe(updateDTO.correlationId);

    const mongoData = contactRepository.findOne(updateDTO.id);
    expect(mongoData).toBeDefined();
    expect(mongoData.name).toBe(updateDTO.name);
  });
});
