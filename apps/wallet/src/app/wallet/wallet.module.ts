import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletGrpcController } from './wallet.grpc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../../typeorm/models/wallets.model';
import { WalletTransaction } from '../../typeorm/models/wallet-transactions.model';
import { LoggerModule } from '@square-me/nestjs';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction]),
    LoggerModule,
  ],
  controllers: [WalletGrpcController],
  providers: [WalletService],
})
export class WalletModule {}
