import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  nestGlobalProvidersPlug,
  pinoLoggerPlug,
  startAppPlug,
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
      url: app.get(ConfigService).getOrThrow('WALLET_GRPC_SERVICE_URL'),
      package: Packages.WALLET,
      protoPath: join(__dirname, '../../libs/grpc/proto/wallet.proto'),
    },
  });

  await startAppPlug(app, true);
}
bootstrap();
