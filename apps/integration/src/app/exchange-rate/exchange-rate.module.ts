import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRateHttpService } from './exchange-rate-http.service';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import {
  TestExchangeRateCommand,
  TestExchangeRateServiceCommand,
} from './exchange-rate.command';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.getOrThrow('EXCHANGE_RATE_URL'),
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
  ],
  providers: [
    ExchangeRateService,
    ExchangeRateHttpService,
    TestExchangeRateCommand,
    TestExchangeRateServiceCommand,
  ],
})
export class ExchangeRateModule {}
