import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  configureApp,
  nestGlobalProvidersPlug,
  securityPlug,
  swaggerPlug,
  startAppPlug,
} from '@square-me/nestjs';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = configureApp(
    await NestFactory.create(AppModule, { bufferLogs: true }),
    [nestGlobalProvidersPlug, securityPlug, swaggerPlug]
  );

  // enable DI for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await startAppPlug(app);
}

bootstrap();
