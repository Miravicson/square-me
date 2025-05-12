import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  nestGlobalProvidersPlug,
  pinoLoggerPlug,
} from '@square-me/nestjs';

import { GrpcOptions } from '@nestjs/microservices';

import { ConfigService } from '@nestjs/config';
import { createWalletGrpcClient } from '@square-me/microservice-client';

async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [pinoLoggerPlug, nestGlobalProvidersPlug]
  );

  app.connectMicroservice<GrpcOptions>(
    createWalletGrpcClient(
      app.get(ConfigService).getOrThrow('WALLET_GRPC_SERVICE_URL')
    )
  );

  await app.startAllMicroservices();
  await app.listen(0);
}
bootstrap();
