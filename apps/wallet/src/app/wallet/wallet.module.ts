import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletGrpcController } from './wallet.grpc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../../typeorm/models/wallets.model';
import { WalletTransaction } from '../../typeorm/models/wallet-transactions.model';
import { LoggerModule } from '@square-me/nestjs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Packages } from '@square-me/grpc';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction]),
    LoggerModule,
    ClientsModule.registerAsync([
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
  controllers: [WalletGrpcController],
  providers: [WalletService],
})
export class WalletModule {}
