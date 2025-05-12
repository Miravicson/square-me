import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionStatus } from './enums';
import { ForexOrder } from './forex-order.model';
import { IsISO4217CurrencyCode } from 'class-validator';
import { Transform } from 'class-transformer';
import { DecimalTransformer, DecimalToString } from '../decimal-transformer';
import Decimal from 'decimal.js';

@Entity()
export class ForexTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  orderId: string;

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
    type: 'decimal',
    default: 0.0,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
    nullable: true,
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  rate: Decimal | null;

  @Column({
    type: 'decimal',
    default: 0.0,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
    nullable: true,
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  resultAmount: Decimal | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ForexOrder, (order) => order.transactions)
  @JoinColumn({ name: 'orderId' })
  order: ForexOrder;
}
