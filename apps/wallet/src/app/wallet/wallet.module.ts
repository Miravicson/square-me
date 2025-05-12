import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletGrpcController } from './wallet.grpc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../../typeorm/models/wallets.model';
import { WalletTransaction } from '../../typeorm/models/wallet-transactions.model';
import { LoggerModule } from '@square-me/nestjs';
import { MicroserviceClientModule } from '@square-me/microservice-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction]),
    LoggerModule,
    MicroserviceClientModule.register({
      clients: ['integration'],
    }),
  ],
  controllers: [WalletGrpcController],
  providers: [WalletService],
})
export class WalletModule {}
