import {
  ClientsModuleAsyncOptions,
  ClientsProviderAsyncOptions,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { Packages } from '@square-me/grpc';
import { ConfigService } from '@nestjs/config';

export function createAuthGrpcClient(grpcUrl: string): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: Packages.AUTH,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  };
}

export const authGrpcClientModuleConfig: ClientsProviderAsyncOptions = {
  name: Packages.AUTH,
  useFactory: (configService: ConfigService) =>
    createAuthGrpcClient(
      configService.getOrThrow<string>('AUTH_GRPC_SERVICE_URL')
    ),
  inject: [ConfigService],
};
