import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import {
  AuthServiceGuard,
  MicroserviceClientModule,
} from '@square-me/microservice-client';
import { CurrencyIsSupportedRule } from './validations/currency-is-supported.rule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForexTransaction } from '../../typeorm/models/forex-transaction.model';
import { ForexOrder } from '../../typeorm/models/forex-order.model';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_FOREX_RETRY, RetryOrderProducer } from './retry-order.producer';
import { RetryOrderConsumer } from './retry-order.consumer';

@Module({
  imports: [
    MicroserviceClientModule.register({
      clients: ['auth', 'wallet', 'integration', 'notification'],
    }),
    TypeOrmModule.forFeature([ForexTransaction, ForexOrder]),
    BullModule.registerQueue({
      name: QUEUE_FOREX_RETRY,
    }),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    AuthServiceGuard,
    CurrencyIsSupportedRule,
    RetryOrderProducer,
    RetryOrderConsumer,
  ],
})
export class TransactionsModule {}
