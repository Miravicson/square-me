import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from '../../typeorm/models/wallets.model';
import { WalletTransaction } from '../../typeorm/models/wallet-transactions.model';
import { DataSource } from 'typeorm';
import { Packages } from '@square-me/grpc';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: {} },
        { provide: getRepositoryToken(WalletTransaction), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: Packages.INTEGRATION, useValue: {} },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
