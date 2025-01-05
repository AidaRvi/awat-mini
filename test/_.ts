import { Test, TestingModule } from '@nestjs/testing';
import { CreateContactDto } from '../src/domain/Dto/create-contact.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientProxy,
  ClientsModule,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { AppModule } from 'src/app.module';
import mongoose from 'mongoose';
import { contactModel } from './contact.schema';
import { EventStoreDBClient } from '@eventstore/db-client';
import { faker } from '@faker-js/faker';

describe('RabbitmqController', () => {
  let client: ClientProxy;
  let streamName: string;
  let esClient: EventStoreDBClient;
  let connection: mongoose.Connection;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/awat-test');

    esClient = EventStoreDBClient.connectionString(
      'esdb://localhost:2114?tls=false',
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: 'RABBITMQ_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'contacts',
              queueOptions: {
                durable: false,
              },
              noAck: true,
            },
          },
        ]),
        AppModule,
      ],
    }).compile();

    const app = module.createNestApplication();
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'contacts',
        queueOptions: {
          durable: false,
        },
        noAck: true,
      },
    });
    await app.startAllMicroservices();
    await app.init();

    client = module.get<ClientProxy>('RABBITMQ_SERVICE');
    connection = mongoose.connection;
  });

  afterAll(async () => {
    await connection.dropCollection('contacts');
    await connection.close();
    esClient.deleteStream(streamName);
    await esClient.dispose();
  });

  it('should handle creating a contact successfully', async () => {
    const contactId = uuidv4();
    const phoneNumber = Number(
      faker.phone.number({ style: 'international' }).slice(1),
    );

    const testMessage: CreateContactDto = {
      id: contactId,
      name: 'Aida',
      phoneNumber,
    };

    const response = await client
      .send('create-contact', testMessage)
      .toPromise();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(response.receivedData).toBeDefined();

    const savedContact = await contactModel.find();
    expect(savedContact.length).toBe(1);

    expect(savedContact[0]._id).toBe(contactId);
    expect(savedContact[0].name).toBe(testMessage.name);
    expect(savedContact[0].phoneNumber).toBe(testMessage.phoneNumber);

    streamName = `contacts-${contactId}`;
    const events = esClient.readStream(streamName);

    const resolvedEvents = [];
    for await (const { event } of events) {
      resolvedEvents.push(event);
    }

    // expect(resolvedEvents.length).toBe(1);
  });
});
