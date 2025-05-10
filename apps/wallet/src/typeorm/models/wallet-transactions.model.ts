import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from './wallets.model';
import Decimal from 'decimal.js';

import { Transform } from 'class-transformer';
import { DecimalToString, DecimalTransformer } from '../decimal-transformer';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  WITHDRAW = 'withdraw',
  FUND = 'fund',
}

@Entity()
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'decimal',
    default: 0.0,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  amount: Decimal;

  @Column()
  currency: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
