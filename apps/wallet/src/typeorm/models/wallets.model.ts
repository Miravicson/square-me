import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';

import Decimal from 'decimal.js';
import { Transform } from 'class-transformer';
import { WalletTransaction } from './wallet-transactions.model';
import { DecimalToString, DecimalTransformer } from '../decimal-transformer';

@Entity()
@Unique(['userId', 'currency'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  currency: string;

  @Column({
    type: 'decimal',
    default: 0.0,
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  @Transform(DecimalToString(), { toPlainOnly: true })
  balance: Decimal;

  @OneToMany(
    () => WalletTransaction,
    (walletTransaction) => walletTransaction.wallet
  )
  transactions: WalletTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
