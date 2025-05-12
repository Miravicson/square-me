import { Module } from '@nestjs/common';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Packages } from '@square-me/grpc';
import { join } from 'path';
import { AuthServiceGuard } from '@square-me/auth-service';
import { ConfigService } from '@nestjs/config';
import { CurrencyIsSupportedRule } from './validations/currency-is-supported.rule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForexTransaction } from '../../typeorm/models/forex-transaction.model';
import { ForexOrder } from '../../typeorm/models/forex-order.model';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_FOREX_RETRY, RetryOrderProducer } from './retry-order.producer';
import { RetryOrderConsumer } from './retry-order.consumer';

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
      // {
      //   name: Packages.NOTIFICATION,
      //   useFactory: (configService: ConfigService) => ({
      //     transport: Transport.GRPC,
      //     options: {
      //       url: configService.getOrThrow('NOTIFICATION_GRPC_URL'),
      //       package: Packages.NOTIFICATION,
      //       protoPath: join(
      //         __dirname,
      //         '../../libs/grpc/proto/notification.proto'
      //       ),
      //     },
      //   }),
      //   inject: [ConfigService],
      // },
      {
        name: Packages.NOTIFICATION,
        useFactory: (configService: ConfigService) => {
          const rabbitMqUrl = configService.getOrThrow<string>('RABBIT_MQ_URL');
          const rabbitMqQueueName = configService.getOrThrow<string>(
            'RABBIT_MQ_QUEUE_NAME'
          );
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitMqUrl],
              queue: rabbitMqQueueName,
              queueOptions: {
                durable: false,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
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
