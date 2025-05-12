import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      type: 'postgres',
      url: this.configService.getOrThrow('DATABASE_URL'),
      autoLoadEntities: true,
      migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
      entities: [join(__dirname, 'models', '**/*.model{.ts,.js}')],
      synchronize: !isProduction,
      logging: !isProduction,
      migrationsRun: true,
      schema: 'public',
      entityPrefix: this.configService.getOrThrow('SERVICE_ENTITY_PREFIX'),
    };
  }
}
