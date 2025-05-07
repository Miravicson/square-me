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
import { AUTH_PACKAGE_NAME } from '@square-me/grpc';

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
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });

  await startAppPlug(app, true);
}

bootstrap();
