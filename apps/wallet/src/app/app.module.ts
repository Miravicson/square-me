import { Module } from '@nestjs/common';
import { WalletModule } from './wallet/wallet.module';
import { LoggerModule } from '@square-me/nestjs';
import { ConfigModule } from '@nestjs/config';
import { TypeormModule } from '@square-me/typeorm';
import { MicroserviceClientModule } from '@square-me/microservice-client';

@Module({
  imports: [
    MicroserviceClientModule.register({
      clients: ['integration'],
    }),
    LoggerModule,
    TypeormModule,
    ConfigModule.forRoot({ isGlobal: true }),
    WalletModule,
  ],
})
export class AppModule {}
