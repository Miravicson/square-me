import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderType, OrderStatus } from './enums';
import { ForexTransaction } from './forex-transaction.model';
import { DecimalToString, DecimalTransformer } from '../decimal-transformer';
import Decimal from 'decimal.js';
import { Transform } from 'class-transformer';
import { IsEmail, IsISO4217CurrencyCode } from 'class-validator';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Entity()
export class ForexOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  @IsEmail()
  userEmail: string;

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  type: OrderType;

  @Column()
  @IsISO4217CurrencyCode()
  baseCurrency: string;

  @Column()
  @IsISO4217CurrencyCode()
  targetCurrency: string;

  @Column({
    type: 'decimal',
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  amount: Decimal;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @Column({ default: 0 })
  retryAttempts: number;

  @Column({
    type: 'enum',
    enum: GrpcStatus,
    nullable: true,
  })
  errorStatus: GrpcStatus | null;

  @Column({ nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ForexTransaction, (transaction) => transaction.order)
  transactions: ForexTransaction[];
}
