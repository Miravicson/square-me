import { NestExpressApplication } from '@nestjs/platform-express';
export type Plug = (app: NestExpressApplication) => NestExpressApplication;
