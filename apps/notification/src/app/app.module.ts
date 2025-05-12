import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@square-me/nestjs';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
