import { Module, Global } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
