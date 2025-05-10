import { Exclude } from 'class-transformer';
import { WalletTransaction } from '../../../typeorm/models/wallet-transactions.model';
import { Wallet } from '../../../typeorm/models/wallets.model';
import Decimal from 'decimal.js';
import { DecimalToString } from '@square-me/nestjs';

export class WalletEntity implements Wallet {
  id: string;
  userId: string;
  currency: string;

  @DecimalToString()
  balance: Decimal;

  walletId: string;

  @Exclude()
  transactions: WalletTransaction[];
  @Exclude()
  createdAt: Date;
  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<WalletEntity> | null) {
    if (data !== null) {
      const { transactions, ...rest } = data;

      Object.assign(this, rest);
      this.walletId = rest.id;
      if (transactions) {
        this.transactions = transactions;
      }
    }
  }
}
