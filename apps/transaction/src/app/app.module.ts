import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './transactions.module';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AuthServiceGuard } from '@square-me/auth-service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@square-me/grpc';
import { join } from 'path';
import { LoggerModule } from '@square-me/nestjs';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TransactionsModule,
    ClientsModule.register([
      {
        name: AUTH_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
        },
      },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, AuthServiceGuard],
})
export class AppModule {}
