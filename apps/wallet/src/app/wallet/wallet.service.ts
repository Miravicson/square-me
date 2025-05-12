import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BuyForexRequest,
  BuyForexResponse,
  ConvertCurrencyRequest,
  CreateWalletRequest,
  CreateWalletResponse,
  FundWalletRequest,
  FundWalletResponse,
  GetAllUserWalletsRequest,
  GetAllUserWalletsResponse,
  GetWalletBalanceRequest,
  GetWalletBalanceResponse,
  IntegrationServiceClient,
  Packages,
  WithdrawWalletRequest,
  WithdrawWalletResponse,
} from '@square-me/grpc';
import { Wallet } from '../../typeorm/models/wallets.model';
import {
  TransactionType,
  WalletTransaction,
} from '../../typeorm/models/wallet-transactions.model';
import { DataSource, EntityManager, Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { tryCatch } from '@square-me/nestjs';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { catchError, firstValueFrom, map } from 'rxjs';
import { INTEGRATION_SERVICE_NAME } from '@square-me/grpc';

interface WalletEntity {
  walletId: string;
  userId: string;
  balance: string;
  currency: string;
}

@Injectable()
export class WalletService implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private integrationService: IntegrationServiceClient;

  constructor(
    @Inject(Packages.INTEGRATION)
    private readonly integrationClient: ClientGrpc,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTxnRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource
  ) {}

  onModuleInit() {
    this.integrationService =
      this.integrationClient.getService<IntegrationServiceClient>(
        INTEGRATION_SERVICE_NAME
      );
  }

  private createWalletEntity(wallet: Wallet): WalletEntity {
    return {
      ...wallet,
      walletId: wallet.id,
      balance: wallet.balance.toFixed(2),
    };
  }

  private validateSufficientFund = (wallet: Wallet, amount: Decimal) => {
    if (wallet.balance.lessThan(amount)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Insufficient balance`,
      });
    }
    return true;
  };

  private async handleWalletTransaction({
    request,
    type,
    description,
    updateBalance,
    validate,
  }: {
    request: { walletId: string; userId: string; amount: string };
    type: TransactionType;
    description: string;
    updateBalance: (balance: Decimal, amount: Decimal) => Decimal;
    validate: (wallet: Wallet, amount: Decimal) => boolean;
  }): Promise<FundWalletResponse | WithdrawWalletResponse> {
    const { data: wallet, error: walletFindErr } = await tryCatch(
      this.walletRepository.findOneOrFail({
        where: { id: request.walletId, userId: request.userId },
      })
    );

    if (walletFindErr) {
      throw new RpcException({
        message: `Could not find wallet [${request.walletId}] for user [${request.userId}]`,
        code: status.NOT_FOUND,
      });
    }

    const amount = new Decimal(request.amount);

    validate(wallet, amount); // custom logic per operation

    const { error: txnErr } = await tryCatch(
      this.dataSource.transaction(async (manager) => {
        wallet.balance = updateBalance(wallet.balance, amount);
        const walletTransaction = this.walletTxnRepository.create({
          amount,
          type,
          currency: wallet.currency,
          description,
          wallet,
        });

        await manager.save([wallet, walletTransaction]);
      })
    );

    if (txnErr) {
      this.logger.error(txnErr);
      throw new RpcException({
        message: `Could not process wallet transaction. Please try again later.`,
        code: status.ABORTED,
      });
    }

    return this.createWalletEntity(wallet);
  }

  private async fetchExchangeRate(
    request: ConvertCurrencyRequest
  ): Promise<Decimal> {
    const { data, error } = await tryCatch(
      firstValueFrom(
        this.integrationService.convertCurrency(request).pipe(
          map((res) => res),
          catchError((err) => {
            this.logger.error(err);
            throw new RpcException({
              code: status.ABORTED,
            });
          })
        )
      )
    );

    if (error) {
      throw error;
    }

    return new Decimal(data.exchangeRate);
  }

  async fundWallet(request: FundWalletRequest): Promise<FundWalletResponse> {
    return this.handleWalletTransaction({
      request,
      type: TransactionType.FUND,
      description: 'Fund wallet',
      updateBalance: (balance, amount) => balance.plus(amount),
      validate: () => true,
    });
  }

  async withdrawWallet(
    request: WithdrawWalletRequest
  ): Promise<WithdrawWalletResponse> {
    return this.handleWalletTransaction({
      request,
      type: TransactionType.WITHDRAW,
      description: 'Withdrawal from wallet',
      updateBalance: (balance, amount) => balance.minus(amount),
      validate: this.validateSufficientFund,
    });
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

    if (!wallets.length) {
      throw new RpcException({
        message: 'User has no wallet',
        code: status.NOT_FOUND,
      });
    }

    return {
      wallets: wallets.map(this.createWalletEntity),
    };
  }

  async getWalletBalance(
    request: GetWalletBalanceRequest
  ): Promise<GetWalletBalanceResponse> {
    const { data: wallet, error } = await tryCatch(
      this.walletRepository.findOneOrFail({
        where: { userId: request.userId, currency: request.walletCurrency },
      })
    );

    if (error) {
      return this.createWallet({
        currency: request.walletCurrency,
        userId: request.userId,
      });
    }

    return this.createWalletEntity(wallet);
  }

  async buyForex(request: BuyForexRequest): Promise<BuyForexResponse> {
    if (!this.integrationService) {
      this.onModuleInit();
    }

    const exchangeRate = await this.fetchExchangeRate({
      from: request.baseCurrency,
      to: request.targetCurrency,
    });

    const [findBaseWalletResult, findTargetWalletResult] = await Promise.all([
      tryCatch(
        this.walletRepository.findOneOrFail({
          where: { currency: request.baseCurrency },
        })
      ),
      tryCatch(
        this.walletRepository.findOneOrFail({
          where: { currency: request.targetCurrency },
        })
      ),
    ]);

    if (findBaseWalletResult.error) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Could not find base wallet',
      });
    }

    const amount = new Decimal(request.amount);
    const targetWalletAmount = amount.mul(exchangeRate);
    const baseWallet = findBaseWalletResult.data;

    this.validateSufficientFund(baseWallet, amount);

    const getOrCreateTargetWallet = async (manager: EntityManager) => {
      if (findTargetWalletResult.error) {
        const wallet = await this.walletRepository.create({
          balance: new Decimal(0.0),
          currency: request.targetCurrency,
          userId: request.userId,
        });

        await manager.save(wallet);
        return wallet;
      }
      return findTargetWalletResult.data;
    };

    const { error: txnErr } = await tryCatch(
      this.dataSource.transaction(async (manager) => {
        const targetWallet = await getOrCreateTargetWallet(manager);
        const targetWalletAmount = amount.mul(exchangeRate);
        baseWallet.balance = baseWallet.balance.minus(amount);
        targetWallet.balance = targetWallet.balance.plus(targetWalletAmount);

        const baseWalletTxn = await this.walletTxnRepository.create({
          amount: amount,
          currency: baseWallet.currency,
          type: TransactionType.DEBIT,
          wallet: baseWallet,
          description: 'Debit for forex purchase',
        });

        const targetWalletTxn = await this.walletTxnRepository.create({
          amount: targetWalletAmount,
          currency: targetWallet.currency,
          type: TransactionType.CREDIT,
          wallet: targetWallet,
          description: 'Credit for forex purchase',
        });

        await manager.save([
          baseWallet,
          targetWallet,
          baseWalletTxn,
          targetWalletTxn,
        ]);
      })
    );

    if (txnErr) {
      this.logger.error(txnErr);
      throw new RpcException({
        code: status.ABORTED,
        message: 'Could not complete forex purchase try again later',
      });
    }

    return {
      message: 'success',
      success: true,
      exchangeRate: exchangeRate.toString(),
      targetAmount: targetWalletAmount.toString(),
    };
  }
}
