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
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
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

type BuyForexServiceOptions = BuyForexInputDto & {
  userId: string;
  userEmail: string;
};

interface TransactionEmailOptions {
  userEmail: string;
  targetCurrency: string;
  orderId: string;
  transactionId: string;
  baseCurrency: string;
}

interface TransactionEmailFailure extends TransactionEmailOptions {
  type: 'failure';
}
interface TransactionEmailSuccess extends TransactionEmailOptions {
  type: 'success';
  targetAmount: string;
  exchangeRate: string;
}

@Injectable()
export class TransactionsService implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private walletService: WalletServiceClient;
  private integrationService: IntegrationServiceClient;
  constructor(
    @Inject(Packages.WALLET) private readonly walletClient: ClientGrpc,
    @Inject(Packages.INTEGRATION)
    private readonly integrationClient: ClientGrpc,
    @Inject(Packages.NOTIFICATION)
    private readonly notificationClient: ClientProxy,
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
          map((res) => this.succeedOrder(forexOrder, forexTxn, res)),
          catchError((err) => {
            switch (err.code) {
              case status.NOT_FOUND:
              case status.INVALID_ARGUMENT:
                return of(
                  this.failOrder(
                    {
                      forexOrder,
                      forexTxn,
                      errMessage: err.message,
                      errCode: err.code,
                    },
                    true
                  )
                );

              case status.ABORTED:
              default:
                return of(
                  this.failOrder(
                    {
                      forexOrder,
                      forexTxn,
                      errMessage: err.message,
                      errCode: err.code,
                    },
                    false
                  )
                );
            }
          })
        )
    );

    return buyForexRes;
  }

  private createTransactionEmail(
    options: TransactionEmailFailure | TransactionEmailSuccess
  ) {
    let subject = '';
    let text = '';

    const { targetCurrency, orderId, baseCurrency } = options;

    if (options.type === 'failure') {
      subject = 'Forex purchase failed';
      text = `Your purchase of ${options.targetCurrency}, with order id: ${options.orderId} failed`;
    } else {
      const { targetAmount, exchangeRate } = options;

      subject = 'Forex purchase completed';
      text = `Your purchase of ${targetCurrency}, with order id: ${orderId} succeeded. Your ${targetCurrency} wallet was credited ${targetAmount} at an exchange rate of 1 ${baseCurrency} --> ${exchangeRate} ${targetCurrency}`;
    }

    return {
      html: '',
      text,
      subject,
      to: options.userEmail,
    };
  }

  async failOrder(
    {
      forexOrder,
      forexTxn,
      errMessage,
      errCode,
    }: {
      forexOrder: ForexOrder;
      forexTxn: ForexTransaction;
      errMessage: string;
      errCode: status;
    },
    hardFail: boolean
  ) {
    await this.forexTxnRepo.update(forexTxn.id, {
      status: TransactionStatus.FAILED,
      errorMessage: errMessage,
      errorStatus: errCode,
    });
    if (hardFail) {
      await this.forexOrderRepo.update(forexOrder.id, {
        status: OrderStatus.FAILED,
        errorMessage: errMessage,
        errorStatus: errCode,
      });

      await firstValueFrom(
        this.notificationClient.emit(
          'send_email',
          this.createTransactionEmail({
            type: 'failure',
            userEmail: forexOrder.userEmail,
            targetCurrency: forexOrder.targetCurrency,
            orderId: forexOrder.id,
            transactionId: forexTxn.id,
            baseCurrency: forexOrder.baseCurrency,
          })
        )
      );

      return {
        message: `Permanent failure: ${errMessage}`,
        forexOrderId: forexOrder.id,
        forexTransactionId: forexTxn.id,
      };
    } else {
      await this.retryOrerProducer.enqueue({
        orderId: forexOrder.id,
        transactionId: forexTxn.id,
        errCode,
        errMessage,
      });

      return {
        message: 'Temporary failure; Retrying order',
        forexOrderId: forexOrder.id,
        forexTransactionId: forexTxn.id,
      };
    }
  }

  private async succeedOrder(
    forexOrder: ForexOrder,
    forexTxn: ForexTransaction,
    walletResponse: BuyForexResponse
  ) {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(ForexOrder, forexOrder.id, {
        status: OrderStatus.COMPLETED,
      });
      await manager.update(ForexTransaction, forexTxn.id, {
        status: TransactionStatus.COMPLETED,
        exchangeRate: new Decimal(walletResponse.exchangeRate),
        targetAmount: new Decimal(walletResponse.targetAmount),
      });
    });

    await firstValueFrom(
      this.notificationClient.emit(
        'send_email',
        this.createTransactionEmail({
          type: 'success',
          userEmail: forexOrder.userEmail,
          baseCurrency: forexOrder.baseCurrency,
          exchangeRate: forexTxn.exchangeRate.toString(),
          orderId: forexOrder.id,
          targetAmount: forexTxn.targetAmount.toString(),
          targetCurrency: forexOrder.targetCurrency,
          transactionId: forexTxn.id,
        })
      )
    );
    return {
      message: 'Order completed',
      forexOrderId: forexOrder.id,
      forexTransactionId: forexTxn.id,
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
        userEmail: options.userEmail,
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
