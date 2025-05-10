import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { AuthServiceGuard } from '@square-me/auth-service';
import { Packages } from '@square-me/grpc';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: AuthServiceGuard, useValue: {} },
        { provide: TransactionsService, useValue: {} },
        { provide: Packages.AUTH, useValue: {} },
        { provide: Packages.WALLET, useValue: {} },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
