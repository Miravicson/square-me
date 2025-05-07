import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import { join } from 'path';

import { Plug } from './definitions';
import { ConfigService } from '@nestjs/config';

export const securityPlug: Plug = (app) => {
  const configService = app.get(ConfigService);
  const corsOrigins = configService.getOrThrow('CORS_ORIGINS');

  const helmetConfig = {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    },
  };

  const corsOptions: CorsOptions = {
    origin: corsOrigins.split(','),
    credentials: true,
  };

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(helmet.contentSecurityPolicy(helmetConfig));
  app.enableCors(corsOptions);
  //Prevent parameter pollution. when there are duplicate query parameters the last one wins.
  app.use(
    hpp({
      whitelist: [],
    })
  );

  return app;
};

export const nestGlobalProvidersPlug: Plug = (app) => {
  const configService = app.get(ConfigService);
  const swaggerPath = configService.get('SWAGGER_PATH') ?? '';
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const apiExcludePaths = ['health'];
  if (swaggerPath) {
    apiExcludePaths.push(swaggerPath);
  }

  app.setGlobalPrefix('api', {
    exclude: apiExcludePaths,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });
  return app;
};

export const pinoLoggerPlug: Plug = (app) => {
  app.useLogger(app.get(PinoLogger));
  return app;
};

export const swaggerPlug: Plug = (app) => {
  const configService = app.get(ConfigService);
  const swaggerTitle = configService.get('SWAGGER_TITLE') ?? '';
  const swaggerDescription = configService.get('SWAGGER_DESCRIPTION') ?? '';
  const swaggerVersion = configService.get('SWAGGER_VERSION') ?? '0.0.0';
  const swaggerPath = configService.getOrThrow('SWAGGER_PATH');
  const swaggerFavicon = configService.get('SWAGGER_FAVICON') ?? '';
  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory(_controllerKey, methodKey) {
      return methodKey;
    },
  });

  const swaggerSetupOptions: SwaggerCustomOptions = {
    jsonDocumentUrl: 'swagger/json',
    yamlDocumentUrl: 'swagger/yaml',
    explorer: false,
    customCss: /*css*/ `
    .swagger-ui .opblock .opblock-summary-operation-id {
      font-size: 14px;
      color: rebeccapurple;
      line-break: normal;
      white-space: nowrap;
      margin-right: 10px;
    }
  `,
    swaggerOptions: {
      displayOperationId: true,
      persistAuthorization: true,
    },
  };

  if (swaggerFavicon) {
    swaggerSetupOptions.customfavIcon = swaggerFavicon;
  }
  SwaggerModule.setup(swaggerPath, app, document, swaggerSetupOptions);
  return app;
};

export const staticPagePlug: Plug = (app) => {
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  return app;
};

export function configureApp(
  app: NestExpressApplication,
  plugs: Plug[]
): NestExpressApplication {
  if (!plugs.length) return app;

  return plugs.reduce<NestExpressApplication>((acc, plug) => {
    const result = plug(acc);
    if (!result) {
      throw new Error('Plug function did not return a valid INestApplication');
    }

    return result;
  }, app);
}

export const startAppPlug = async (
  app: NestExpressApplication,
  isMicroservice = false,
  plugs: Plug[] = []
) => {
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);
  const swaggerPath = configService.get('SWAGGER_PATH') ?? '';
  const appPort = configService.getOrThrow('PORT');
  const appHostName = configService.get('HOST_NAME') ?? '0.0.0.0';

  if (plugs.length) {
    configureApp(app, plugs);
  }

  if (isMicroservice) {
    await app.startAllMicroservices();
  }

  await app.listen(appPort, appHostName);
  const appUrl = (await app.getUrl())
    .replace('[::1]', 'localhost')
    .replace('127.0.0.1', 'localhost');
  logger.log(`Starting Service on ${appUrl} ✅`);
  if (swaggerPath) {
    logger.log(`Documentation is found at ${appUrl}/${swaggerPath} 📜`);
  }

  return app;
};

export const webSocketsPlug: Plug = (app) => {
  app.useWebSocketAdapter(new WsAdapter(app));
  const expressApp = app.get(HttpAdapterHost).httpAdapter.getInstance();
  expressApp.set('trust proxy', 1);
  return app;
};
