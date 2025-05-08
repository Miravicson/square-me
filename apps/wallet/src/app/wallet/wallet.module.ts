import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletGrpcController } from './wallet.grpc.controller';

@Module({
  imports: [],
  controllers: [WalletGrpcController],
  providers: [WalletService],
})
export class WalletModule {}
