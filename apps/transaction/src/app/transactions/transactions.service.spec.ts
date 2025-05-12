import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Packages } from '@square-me/grpc';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForexTransaction } from '../../typeorm/models/forex-transaction.model';
import { ForexOrder } from '../../typeorm/models/forex-order.model';
import { DataSource } from 'typeorm';
import { RetryOrderProducer } from './retry-order.producer';

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: Packages.WALLET, useValue: {} },
        { provide: Packages.INTEGRATION, useValue: {} },
        { provide: Packages.NOTIFICATION, useValue: {} },
        { provide: getRepositoryToken(ForexTransaction), useValue: {} },
        { provide: getRepositoryToken(ForexOrder), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: RetryOrderProducer, useValue: {} },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
