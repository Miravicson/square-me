import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../typeorm/models/users.model';
import { UsersController } from './users.controller';
import { CurrencyIsSupportedRule } from './validations/currency-is-supported.rule';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  controllers: [UsersController],
  providers: [UsersService, CurrencyIsSupportedRule],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
