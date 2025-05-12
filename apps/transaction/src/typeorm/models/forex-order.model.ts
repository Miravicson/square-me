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
import { IsISO4217CurrencyCode } from 'class-validator';

@Entity()
export class ForexOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

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
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  amount: Decimal;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ForexTransaction, (transaction) => transaction.order)
  transactions: ForexTransaction[];
}
