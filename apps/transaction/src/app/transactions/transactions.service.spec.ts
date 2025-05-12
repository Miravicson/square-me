import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { Packages } from '@square-me/grpc';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForexTransaction } from '../../typeorm/models/forex-transaction.model';
import { ForexOrder } from '../../typeorm/models/forex-order.model';
import { DataSource } from 'typeorm';
import { RetryOrderProducer } from './retry-order.producer';
import { NOTIFICATION_CLIENT } from '@square-me/microservice-client';

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: Packages.WALLET, useValue: {} },
        { provide: Packages.INTEGRATION, useValue: {} },
        { provide: NOTIFICATION_CLIENT, useValue: {} },
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
