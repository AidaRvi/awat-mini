import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  await app.listen(process.env.PORT);
}
bootstrap();
