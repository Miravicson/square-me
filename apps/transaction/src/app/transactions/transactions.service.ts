import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { tryCatch } from '@square-me/nestjs';
import {
  BuyForexResponse,
  FundWalletRequest,
  INTEGRATION_SERVICE_NAME,
  IntegrationServiceClient,
  Packages,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
  WithdrawWalletRequest,
} from '@square-me/grpc';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { BuyForexInputDto } from './dto/buy-forex-input.dto';
import Decimal from 'decimal.js';
import { status } from '@grpc/grpc-js';
import { ForexTransaction } from '../../typeorm/models/forex-transaction.model';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ForexOrder } from '../../typeorm/models/forex-order.model';
import {
  OrderStatus,
  OrderType,
  TransactionStatus,
} from '../../typeorm/models/enums';
import { RetryOrderProducer } from './retry-order.producer';

type BuyForexServiceOptions = BuyForexInputDto & { userId: string };

@Injectable()
export class TransactionsService implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private walletService: WalletServiceClient;
  private integrationService: IntegrationServiceClient;
  constructor(
    @Inject(Packages.WALLET) private readonly walletClient: ClientGrpc,
    @Inject(Packages.INTEGRATION)
    private readonly integrationClient: ClientGrpc,
    @InjectRepository(ForexTransaction)
    private readonly forexTxnRepo: Repository<ForexTransaction>,
    @InjectRepository(ForexOrder)
    private readonly forexOrderRepo: Repository<ForexOrder>,
    private readonly dataSource: DataSource,
    private readonly retryOrerProducer: RetryOrderProducer
  ) {}

  onModuleInit() {
    this.getOrCreateWalletService();
    this.getOrCreateIntegrationService();
  }

  private getOrCreateWalletService() {
    if (!this.walletService) {
      this.walletService =
        this.walletClient.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
    }
  }

  private getOrCreateIntegrationService() {
    if (!this.integrationService) {
      this.integrationService =
        this.integrationClient.getService<IntegrationServiceClient>(
          INTEGRATION_SERVICE_NAME
        );
    }
  }

  async processForexPurchase(forexOrder: ForexOrder) {
    const forexTxn = await this.forexTxnRepo.save(
      this.forexTxnRepo.create({
        userId: forexOrder.userId,
        orderId: forexOrder.id,
        baseCurrency: forexOrder.baseCurrency,
        targetCurrency: forexOrder.targetCurrency,
        amount: new Decimal(forexOrder.amount),
        status: TransactionStatus.INITIATED,
        exchangeRate: null,
        targetAmount: null,
      })
    );

    const buyForexRes = await firstValueFrom(
      this.walletService
        .buyForex({
          amount: forexOrder.amount.toString(),
          baseCurrency: forexOrder.baseCurrency,
          targetCurrency: forexOrder.targetCurrency,
          userId: forexOrder.userId,
        })
        .pipe(
          map((res) => this.succeedOrder(forexOrder.id, forexTxn.id, res)),
          catchError((err) => {
            switch (err.code) {
              case status.NOT_FOUND:
              case status.INVALID_ARGUMENT:
                return of(
                  this.failOrder(
                    forexOrder.id,
                    forexTxn.id,
                    err.message,
                    err.code,
                    true
                  )
                );

              case status.ABORTED:
              default:
                return of(
                  this.failOrder(
                    forexOrder.id,
                    forexTxn.id,
                    err.message,
                    err.code,
                    false
                  )
                );
            }
          })
        )
    );

    return buyForexRes;
  }

  async failOrder(
    orderId: string,
    transactionId: string,
    errMessage: string,
    errCode: status,
    hardFail = false
  ) {
    await this.forexTxnRepo.update(transactionId, {
      status: TransactionStatus.FAILED,
      errorMessage: errMessage,
      errorStatus: errCode,
    });
    if (hardFail) {
      await this.forexOrderRepo.update(orderId, {
        status: OrderStatus.FAILED,
        errorMessage: errMessage,
        errorStatus: errCode,
      });

      return {
        message: 'Permanent failure',
        forexOrderId: orderId,
        forexTransactionId: transactionId,
      };
    } else {
      await this.retryOrerProducer.enqueue({
        orderId,
        transactionId,
        errCode,
        errMessage,
      });

      return {
        message: 'Temporary failure; Retrying order',
        forexOrderId: orderId,
        forexTransactionId: transactionId,
      };
    }
  }

  private async succeedOrder(
    orderId: string,
    transactionId: string,
    walletResponse: BuyForexResponse
  ) {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(ForexOrder, orderId, {
        status: OrderStatus.COMPLETED,
      });
      await manager.update(ForexTransaction, transactionId, {
        status: TransactionStatus.COMPLETED,
        exchangeRate: new Decimal(walletResponse.exchangeRate),
        targetAmount: new Decimal(walletResponse.targetAmount),
      });
    });

    return {
      message: 'Order completed',
      forexOrderId: orderId,
      forexTransactionId: transactionId,
    };
  }

  private async processWalletFunding(payload: FundWalletRequest) {
    const { data: res, error } = await tryCatch(
      firstValueFrom(
        this.walletService.fundWallet(payload).pipe(
          map((res) => res),
          catchError((err) => {
            this.logger.error(err);

            switch (err.code) {
              case status.NOT_FOUND: {
                throw new NotFoundException(err.message);
              }
              case status.INVALID_ARGUMENT: {
                throw new BadRequestException(err.message);
              }
              case status.ABORTED: {
                throw new InternalServerErrorException(err.message);
              }
              default:
                throw new InternalServerErrorException(
                  'Unable to complete funding. Please try again later'
                );
            }
          })
        )
      )
    );

    if (error) {
      throw error;
    }

    return res;
  }

  private async processWalletWithdrawal(payload: WithdrawWalletRequest) {
    const { data: res, error } = await tryCatch(
      firstValueFrom(
        this.walletService.withdrawWallet(payload).pipe(
          map((res) => res),
          catchError((err) => {
            this.logger.error(err);

            switch (err.code) {
              case status.NOT_FOUND: {
                throw new NotFoundException(err.message);
              }
              case status.INVALID_ARGUMENT: {
                throw new BadRequestException(err.message);
              }
              case status.ABORTED: {
                throw new InternalServerErrorException(err.message);
              }
              default:
                throw new InternalServerErrorException(
                  'Unable to complete funding. Please try again later'
                );
            }
          })
        )
      )
    );

    if (error) {
      throw error;
    }

    return res;
  }

  async buyForex(options: BuyForexServiceOptions) {
    const forexOrder = await this.forexOrderRepo.save(
      this.forexOrderRepo.create({
        userId: options.userId,
        type: OrderType.BUY,
        baseCurrency: options.baseCurrency,
        targetCurrency: options.targetCurrency,
        amount: new Decimal(options.amount),
        status: OrderStatus.PENDING,
      })
    );

    return this.processForexPurchase(forexOrder);
  }

  async fundWallet(userId: string, walletId: string, amount: string) {
    return await this.processWalletFunding({ userId, walletId, amount });
  }

  async withdrawWallet(userId: string, walletId: string, amount: string) {
    return await this.processWalletWithdrawal({ userId, walletId, amount });
  }
}
