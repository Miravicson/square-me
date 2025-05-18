import { status } from '@grpc/grpc-js';
import { TransactionStatus } from '../../../typeorm/models/enums';

import Decimal from 'decimal.js';

import { ForexTransaction } from '../../../typeorm/models/forex-transaction.model';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DecimalToString } from '@square-me/nestjs';
import { ForexOrder } from '../../../typeorm/models/forex-order.model';

export class ForexTransactionEntity implements ForexTransaction {
  constructor(data: Partial<ForexTransactionEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
  id: string;
  userId: string;
  orderId: string;
  baseCurrency: string;
  targetCurrency: string;
  @DecimalToString()
  amount: Decimal;

  @DecimalToString(5)
  exchangeRate: Decimal;
  @DecimalToString()
  targetAmount: Decimal;
  status: TransactionStatus;
  createdAt: Date;

  @Exclude()
  @ApiHideProperty()
  order: ForexOrder;

  @Exclude()
  @ApiHideProperty()
  errorStatus: status;

  @Exclude()
  @ApiHideProperty()
  errorMessage: string;
}
