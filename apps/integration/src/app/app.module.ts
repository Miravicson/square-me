import { Module } from '@nestjs/common';
import { LoggerModule, RedisModule } from '@square-me/nestjs';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { ConfigModule } from '@nestjs/config';
import { IntegrationGrpcController } from './integration.grpc.controller';
import { IntegrationService } from './integration.service';

@Module({
  imports: [
    LoggerModule,
    RedisModule,
    ExchangeRateModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [IntegrationGrpcController],
  providers: [IntegrationService],
})
export class AppModule {}
