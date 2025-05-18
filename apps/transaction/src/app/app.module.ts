import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionsModule } from './transactions/transactions.module';
import { LoggerModule } from '@square-me/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { TypeormModule } from '@square-me/typeorm';
import { MicroserviceClientModule } from '@square-me/microservice-client';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeormModule,
    TransactionsModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    MicroserviceClientModule.register({
      clients: ['auth', 'wallet', 'integration', 'notification'],
    }),
  ],
})
export class AppModule {}
