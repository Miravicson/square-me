import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { GrpcUser, Packages } from '@square-me/grpc';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForexTransaction } from '../../typeorm/models/forex-transaction.model';
import { ForexOrder } from '../../typeorm/models/forex-order.model';
import { DataSource } from 'typeorm';
import { RetryOrderProducer } from './retry-order.producer';
import { NotificationService } from '@square-me/microservice-client';
import { paginate } from 'nestjs-typeorm-paginate';

import Decimal from 'decimal.js';
import { ForexOrderEntity } from './entities/forex-order.entity';
import { PaginationMeta } from './entities/api-paginated-response';
jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('TransactionsService', () => {
  let service: TransactionsService;
  let walletClient: any;
  let integrationClient: any;
  let notificationService: any;
  let forexTxnRepo: any;
  let forexOrderRepo: any;
  let retryOrderProducer: any;
  let dataSource: any;

  beforeEach(async () => {
    walletClient = {
      getService: jest.fn(),
    };
    integrationClient = {
      getService: jest.fn(),
    };
    notificationService = {
      notifyUser: jest.fn(),
    };
    forexTxnRepo = {
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    forexOrderRepo = {
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    retryOrderProducer = {
      enqueue: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: Packages.WALLET, useValue: walletClient },
        { provide: Packages.INTEGRATION, useValue: integrationClient },
        { provide: NotificationService, useValue: notificationService },
        {
          provide: getRepositoryToken(ForexTransaction),
          useValue: forexTxnRepo,
        },
        { provide: getRepositoryToken(ForexOrder), useValue: forexOrderRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: RetryOrderProducer, useValue: retryOrderProducer },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call getOrCreateWalletService and getOrCreateIntegrationService', () => {
      // Spy on the private methods
      const getOrCreateWalletService = jest.spyOn<any, any>(
        service as any,
        'getOrCreateWalletService'
      );
      const getOrCreateIntegrationService = jest.spyOn<any, any>(
        service as any,
        'getOrCreateIntegrationService'
      );
      service.onModuleInit();
      expect(getOrCreateWalletService).toHaveBeenCalled();
      expect(getOrCreateIntegrationService).toHaveBeenCalled();
    });
  });

  describe('paginateForexOrders', () => {
    it('should call paginate with forexOrderRepo and options', async () => {
      (paginate as jest.Mock).mockResolvedValue('paginated');
      const options = { page: 1, limit: 10 };
      const result = await service.paginateForexOrders(options);
      expect(paginate).toHaveBeenCalledWith(forexOrderRepo, options);
      expect(result).toBe('paginated');
    });
  });

  describe('buyForex', () => {
    it('should save forex order and process forex purchase', async () => {
      const createObj = { foo: 'bar' };
      const savedOrder = {
        id: 'order1',
        userId: 'user1',
        baseCurrency: 'USD',
        targetCurrency: 'EUR',
        amount: '100',
        userEmail: 'test@email.com',
      };
      forexOrderRepo.create.mockReturnValue(createObj);
      forexOrderRepo.save.mockResolvedValue(savedOrder);
      const processForexPurchase = jest
        .spyOn(service as any, 'processForexPurchase')
        .mockResolvedValue('processed');
      const input = {
        userId: 'user1',
        baseCurrency: 'USD',
        targetCurrency: 'EUR',
        amount: '100',
        userEmail: 'test@email.com',
      };
      const result = await service.buyForex(input);
      expect(forexOrderRepo.create).toHaveBeenCalledWith({
        userId: input.userId,
        type: expect.anything(),
        baseCurrency: input.baseCurrency,
        targetCurrency: input.targetCurrency,
        amount: expect.any(Decimal),
        status: expect.anything(),
        userEmail: input.userEmail,
      });
      expect(forexOrderRepo.save).toHaveBeenCalledWith(createObj);
      expect(processForexPurchase).toHaveBeenCalledWith(savedOrder);
      expect(result).toBe('processed');
    });
  });

  describe('fundWallet', () => {
    it('should call processWalletFunding with correct payload', async () => {
      const processWalletFunding = jest
        .spyOn<any, any>(service as any, 'processWalletFunding')
        .mockResolvedValue('funded');

      const user: GrpcUser = { id: 'user1', email: 'user1@company.com' };
      const result = await service.fundWallet(user, 'wallet1', '100');
      expect(processWalletFunding).toHaveBeenCalledWith(user, {
        walletId: 'wallet1',
        amount: '100',
      });
      expect(result).toBe('funded');
    });
  });

  describe('withdrawWallet', () => {
    it('should call processWalletWithdrawal with correct payload', async () => {
      const processWalletWithdrawal = jest
        .spyOn<any, any>(service as any, 'processWalletWithdrawal')
        .mockResolvedValue('withdrawn');
      const user: GrpcUser = { id: 'user1', email: 'user1@company.com' };
      const result = await service.withdrawWallet(user, 'wallet1', '50');
      expect(processWalletWithdrawal).toHaveBeenCalledWith(user, {
        walletId: 'wallet1',
        amount: '50',
      });
      expect(result).toBe('withdrawn');
    });
  });

  describe('getManyForexOrder', () => {
    it('should build query, call paginate, and return mapped items', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      forexOrderRepo.createQueryBuilder.mockReturnValue(qb);
      const paginatedResult = {
        items: [
          new ForexOrderEntity({
            amount: new Decimal('20'),
            baseCurrency: 'NGN',
            targetCurrency: 'USD',
          }),
        ],
        meta: { currentPage: 1, itemCount: 1, totalItems: 1 },
      };

      (paginate as jest.Mock).mockResolvedValue(paginatedResult);
      const result = await service.getManyForexOrder('user1', {
        page: 1,
        limit: 1,
      });
      expect(forexOrderRepo.createQueryBuilder).toHaveBeenCalledWith('f');
      expect(qb.where).toHaveBeenCalledWith('f.userId = :id', { id: 'user1' });
      expect(qb.orderBy).toHaveBeenCalledWith('f.createdAt', 'DESC');
      expect(result.items).toBeDefined();
      expect(result.currentPage).toBe(1);
      expect(result.itemCount).toBe(1);
    });
  });

  describe('getManyForexTransactions', () => {
    it('should build query, call paginate, and return mapped items', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };
      forexTxnRepo.createQueryBuilder.mockReturnValue(qb);
      const paginatedResult = {
        items: [{ foo: 'txn' }],
        meta: {
          currentPage: 1,
          itemCount: 5,
          totalItems: 2,
          itemsPerPage: 5,
          lastPage: 1,
          totalPages: 1,
        } satisfies PaginationMeta,
      };

      (paginate as jest.Mock).mockResolvedValue(paginatedResult);
      const result = await service.getManyForexTransactions('user2', {
        page: 1,
        limit: 5,
      });
      expect(forexTxnRepo.createQueryBuilder).toHaveBeenCalledWith('f');
      expect(qb.where).toHaveBeenCalledWith('f.userId = :id', { id: 'user2' });
      expect(qb.andWhere).toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('f.createdAt', 'DESC');
      expect(result.items).toBeDefined();
      expect(result.currentPage).toBe(1);
      expect(result.itemCount).toBe(5);
    });
  });
});
