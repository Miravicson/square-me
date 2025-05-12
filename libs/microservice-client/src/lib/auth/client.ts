import { NestApplication } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Packages } from '@square-me/grpc';
import { ConfigService } from '@nestjs/config';

export function authGrpcClient(app: NestApplication): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('AUTH_GRPC_SERVICE_URL'),
      package: Packages.AUTH,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  };
}
