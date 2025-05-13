import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const options = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  entities: [join(__dirname, 'models', '**/*.model{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],

  schema: 'public',
} satisfies TypeOrmModuleOptions;

export default new DataSource(options);
