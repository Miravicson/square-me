import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  nestGlobalProvidersPlug,
  pinoLoggerPlug,
} from '@square-me/nestjs';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { createNotificationRMqClient } from '@square-me/microservice-client';
async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [pinoLoggerPlug, nestGlobalProvidersPlug]
  );

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>(
    createNotificationRMqClient(
      configService.getOrThrow<string>('RABBIT_MQ_URL'),
      configService.getOrThrow<string>('RABBIT_MQ_QUEUE_NAME')
    )
  );

  await app.startAllMicroservices();
  await app.listen(0);
}

bootstrap();
