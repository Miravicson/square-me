import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../typeorm/models/users.model';
import { UsersController } from './users.controller';
import { CurrencyIsSupportedRule } from './validations/currency-is-supported.rule';
import { MicroserviceClientModule } from '@square-me/microservice-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    MicroserviceClientModule.register({ clients: ['wallet', 'integration'] }),
  ],
  controllers: [UsersController],
  providers: [UsersService, CurrencyIsSupportedRule],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
