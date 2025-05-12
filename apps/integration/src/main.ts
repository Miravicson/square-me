import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  nestGlobalProvidersPlug,
  pinoLoggerPlug,
} from '@square-me/nestjs';

import { GrpcOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { createIntegrationGrpcClient } from '@square-me/microservice-client';

async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [pinoLoggerPlug, nestGlobalProvidersPlug]
  );

  const configService = app.get(ConfigService);

  app.connectMicroservice<GrpcOptions>(
    createIntegrationGrpcClient(
      configService.getOrThrow<string>('INTEGRATION_GRPC_URL')
    )
  );

  await app.startAllMicroservices();
  await app.listen(0); // needed to ensure cron job runs
}
bootstrap();
