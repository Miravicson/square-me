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
import { GrpcOptions } from '@nestjs/microservices';
import { useContainer } from 'class-validator';
import { createAuthGrpcClient } from '@square-me/microservice-client';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [pinoLoggerPlug, nestGlobalProvidersPlug, securityPlug, swaggerPlug]
  );
  const configService = app.get(ConfigService);
  // enable DI for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.connectMicroservice<GrpcOptions>(
    createAuthGrpcClient(
      configService.getOrThrow<string>('AUTH_GRPC_SERVICE_URL')
    )
  );

  await startAppPlug(app, true);
}

bootstrap();
