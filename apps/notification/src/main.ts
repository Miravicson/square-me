import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  nestGlobalProvidersPlug,
  pinoLoggerPlug,
} from '@square-me/nestjs';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [pinoLoggerPlug, nestGlobalProvidersPlug]
  );

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBIT_MQ_URL')],
      queue: configService.getOrThrow<string>('RABBIT_MQ_QUEUE_NAME'),
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(0);
}

bootstrap();
