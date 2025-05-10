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
import { ValueTransformer } from 'typeorm';
import { Transform, TransformFnParams } from 'class-transformer';
import { WalletTransaction } from './wallet-transactions.model';

export const DecimalToString =
  (decimals = 2) =>
  ({ value }: TransformFnParams) =>
    value?.toFixed?.(decimals);

export class DecimalTransformer implements ValueTransformer {
  /**
   * Used to marshal Decimal when writing to the database.
   */
  to(decimal?: Decimal): string | null {
    return decimal?.toString();
  }
  /**
   * Used to unmarshal Decimal when reading from the database.
   */
  from(decimal?: string): Decimal | null {
    return decimal ? new Decimal(decimal) : null;
  }
}

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
