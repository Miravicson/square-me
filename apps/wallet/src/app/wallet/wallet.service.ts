import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BuyForexResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  FundWalletRequest,
  FundWalletResponse,
  GetAllUserWalletsRequest,
  GetAllUserWalletsResponse,
  GetWalletBalanceRequest,
  GetWalletBalanceResponse,
} from '@square-me/grpc';
import { Wallet } from '../../typeorm/models/wallets.model';
import { WalletTransaction } from '../../typeorm/models/wallet-transactions.model';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';

interface WalletEntity {
  walletId: string;
  userId: string;
  balance: string;
  currency: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTxnRepository: Repository<WalletTransaction>
  ) {}

  private createWalletEntity(wallet: Wallet): WalletEntity {
    return {
      ...wallet,
      walletId: wallet.id,
      balance: wallet.balance.toFixed(2),
    };
  }

  async fundWallet(request: FundWalletRequest): Promise<FundWalletResponse> {
    return {
      balance: '2000',
      currency: '',
      userId: request.userId,
      walletId: request.walletId,
    };
  }

  async createWallet(
    request: CreateWalletRequest
  ): Promise<CreateWalletResponse> {
    const existingWallet = await this.walletRepository.findOneBy({
      userId: request.userId,
      currency: request.currency,
    });

    if (existingWallet) {
      this.logger.debug(`Existing wallet: ${JSON.stringify(existingWallet)}`);
      return this.createWalletEntity(existingWallet);
    }

    const wallet = await this.walletRepository.create({
      balance: new Decimal('0'),
      currency: request.currency,
      userId: request.userId,
    });

    await this.walletRepository.save(wallet);
    this.logger.debug(`Saving wallet: ${JSON.stringify(wallet)}`);

    return this.createWalletEntity(wallet);
  }

  async getAllUserWallets(
    request: GetAllUserWalletsRequest
  ): Promise<GetAllUserWalletsResponse> {
    const wallets = await this.walletRepository.findBy({
      userId: request.userId,
    });

    return {
      wallets: wallets.map(this.createWalletEntity),
    };
  }

  async getWalletBalance(
    request: GetWalletBalanceRequest
  ): Promise<GetWalletBalanceResponse> {
    this.logger.verbose('Getting wallet balance for wallet');

    return {
      balance: '200',
      currency: 'CAD',
      userId: request.userId,
      walletId: '1235335',
    };
  }

  async buyForex(request): Promise<BuyForexResponse> {
    this.logger.verbose('About buying forex');

    return {
      message: 'success',
      success: true,
    };
  }
}
