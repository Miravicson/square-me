import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from '@square-me/nestjs';

import { TypeormModule } from '@square-me/typeorm';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    TypeormModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
