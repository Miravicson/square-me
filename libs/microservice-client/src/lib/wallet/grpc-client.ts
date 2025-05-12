import {
  ClientsProviderAsyncOptions,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { Packages } from '@square-me/grpc';
import { ConfigService } from '@nestjs/config';

export function createWalletGrpcClient(grpcUrl: string): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: Packages.WALLET,
      protoPath: join(__dirname, '../../libs/grpc/proto/wallet.proto'),
    },
  };
}

export const walletGrpcClientModuleConfig: ClientsProviderAsyncOptions = {
  name: Packages.WALLET,
  useFactory: (configService: ConfigService) =>
    createWalletGrpcClient(
      configService.getOrThrow<string>('WALLET_GRPC_SERVICE_URL')
    ),
  inject: [ConfigService],
};
