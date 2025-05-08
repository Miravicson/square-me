import { NestExpressApplication } from '@nestjs/platform-express';
export type Plug = (app: NestExpressApplication) => NestExpressApplication;
export type Success<T> = {
  data: T;
  error: null;
};

export type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;
