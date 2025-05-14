import { status } from '@grpc/grpc-js';
import { OrderType, OrderStatus } from '../../../typeorm/models/enums';

import Decimal from 'decimal.js';
import { ForexOrder } from '../../../typeorm/models/forex-order.model';
import { ForexTransaction } from '../../../typeorm/models/forex-transaction.model';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { DecimalToString } from '@square-me/nestjs';

export class ForexOrderEntity implements ForexOrder {
  id: string;
  userId: string;
  userEmail: string;
  type: OrderType;
  baseCurrency: string;
  targetCurrency: string;
  @DecimalToString()
  amount: Decimal;
  status: OrderStatus;
  retryAttempts: number;
  errorStatus: status;
  errorMessage: string;

  @ApiHideProperty()
  @Exclude()
  createdAt: Date;
  @ApiHideProperty()
  @Exclude()
  updatedAt: Date;
  @ApiHideProperty()
  @Exclude()
  transactions: ForexTransaction[];

  constructor(data: Partial<ForexOrderEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
