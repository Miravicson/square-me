import { Module } from '@nestjs/common';
import { WalletModule } from './wallet/wallet.module';
import { LoggerModule } from '@square-me/nestjs';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    WalletModule,
  ],
})
export class AppModule {}
