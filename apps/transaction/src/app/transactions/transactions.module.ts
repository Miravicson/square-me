import { Module } from '@nestjs/common';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Packages } from '@square-me/grpc';
import { join } from 'path';
import { AuthServiceGuard } from '@square-me/auth-service';
import { ConfigService } from '@nestjs/config';
import { CurrencyIsSupportedRule } from './validations/currency-is-supported.rule';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: Packages.AUTH,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('AUTH_GRPC_SERVICE_URL'),
            package: Packages.AUTH,
            protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: Packages.WALLET,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('WALLET_GRPC_SERVICE_URL'),
            package: Packages.WALLET,
            protoPath: join(__dirname, '../../libs/grpc/proto/wallet.proto'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: Packages.INTEGRATION,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('INTEGRATION_GRPC_URL'),
            package: Packages.INTEGRATION,
            protoPath: join(
              __dirname,
              '../../libs/grpc/proto/integration.proto'
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, AuthServiceGuard, CurrencyIsSupportedRule],
})
export class TransactionsModule {}
