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
  FundWalletRequest,
  Packages,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
  WithdrawWalletRequest,
} from '@square-me/grpc';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom, map } from 'rxjs';
import { BuyForexInputDto } from './dto/buy-forex-input.dto';
import Decimal from 'decimal.js';
import { BuyForexRequest } from '@square-me/grpc';
import { status } from '@grpc/grpc-js';

type BuyForexServiceOptions = BuyForexInputDto & { userId: string };

@Injectable()
export class TransactionsService implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private walletService: WalletServiceClient;
  constructor(
    @Inject(Packages.WALLET) private readonly walletClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.walletService =
      this.walletClient.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
  }

  private async checkWalletBalace(userId: string, currency: string) {
    const { data: walletBalanceRes, error: walletBalanceErr } = await tryCatch(
      firstValueFrom(
        this.walletService
          .getWalletBalance({
            userId: userId,
            walletCurrency: currency,
          })
          .pipe(
            map((res) => res),
            catchError((err) => {
              this.logger.error(
                `Could not fetch wallet balance for wallet with currency: [${currency}] for user with id: [${userId}]`,
                err.stack
              );
              throw new InternalServerErrorException(
                'Could not complete query for wallet balance'
              );
            })
          )
      )
    );

    if (walletBalanceErr) {
      throw walletBalanceErr;
    }

    return walletBalanceRes;
  }

  private validateWalletSufficientFunds(
    amount: string,
    walletBalance: string
  ): boolean {
    const result = new Decimal(walletBalance).greaterThanOrEqualTo(
      new Decimal(amount)
    );

    if (!result) {
      throw new BadRequestException(
        'Insufficient funds in wallet. Top up wallet and try again'
      );
    }

    return result;
  }

  private async processForexPurchase(payload: BuyForexRequest) {
    const { data: buyForexRes, error: buyError } = await tryCatch(
      firstValueFrom(
        this.walletService
          .buyForex({
            amount: payload.amount,
            baseCurrency: payload.baseCurrency,
            targetCurrency: payload.targetCurrency,
            userId: payload.userId,
          })
          .pipe(
            map((res) => res),
            catchError((err) => {
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
                    'Could not complet purchase of forex, try again later'
                  );
              }
            })
          )
      )
    );

    if (buyError) {
      throw buyError;
    }

    return buyForexRes;
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
    const walletBalance = await this.checkWalletBalace(
      options.userId,
      options.baseCurrency
    );

    this.validateWalletSufficientFunds(options.amount, walletBalance.balance);
    return this.processForexPurchase(options);
  }

  async fundWallet(userId: string, walletId: string, amount: string) {
    return await this.processWalletFunding({ userId, walletId, amount });
  }

  async withdrawWallet(userId: string, walletId: string, amount: string) {
    return await this.processWalletWithdrawal({ userId, walletId, amount });
  }
}
