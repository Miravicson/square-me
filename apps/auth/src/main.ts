import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  startAppPlug,
  swaggerPlug,
  nestGlobalProvidersPlug,
  securityPlug,
  pinoLoggerPlug,
} from '@square-me/nestjs';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { useContainer } from 'class-validator';
import { Packages } from '@square-me/grpc';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [pinoLoggerPlug, nestGlobalProvidersPlug, securityPlug, swaggerPlug]
  );

  // enable DI for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('AUTH_GRPC_SERVICE_URL'),
      package: Packages.AUTH,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });

  await startAppPlug(app, true);
}

bootstrap();
