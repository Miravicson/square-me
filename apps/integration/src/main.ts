import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  nestGlobalProvidersPlug,
  pinoLoggerPlug,
} from '@square-me/nestjs';

import { GrpcOptions, Transport } from '@nestjs/microservices';
import { Packages } from '@square-me/grpc';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [pinoLoggerPlug, nestGlobalProvidersPlug]
  );

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('INTEGRATION_GRPC_URL'),
      package: Packages.INTEGRATION,
      protoPath: join(__dirname, '../../libs/grpc/proto/integration.proto'),
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
