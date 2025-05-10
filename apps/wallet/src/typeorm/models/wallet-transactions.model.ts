import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from './wallets.model';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity()
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  currency: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
