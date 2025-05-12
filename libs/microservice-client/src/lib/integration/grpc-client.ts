import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Packages } from '@square-me/grpc';
import { ConfigService } from '@nestjs/config';

export function createIntegrationGrpcClient(grpcUrl: string): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: Packages.INTEGRATION,
      protoPath: join(__dirname, '../../libs/grpc/proto/integration.proto'),
    },
  };
}

export const integrationGrpcClientModuleConfig = {
  name: Packages.INTEGRATION,
  useFactory: (configService: ConfigService) =>
    createIntegrationGrpcClient(
      configService.getOrThrow<string>('INTEGRATION_GRPC_URL')
    ),
  inject: [ConfigService],
};
