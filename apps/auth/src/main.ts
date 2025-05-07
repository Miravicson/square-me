/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { configureApp, startAppPlug, swaggerPlug } from '@square-me/nestjs';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [swaggerPlug]
  );

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });

  await startAppPlug(app, true);
}

bootstrap();
