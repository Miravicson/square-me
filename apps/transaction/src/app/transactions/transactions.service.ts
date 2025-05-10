import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { tryCatch } from '@square-me/nestjs';
import {
  Packages,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
} from '@square-me/grpc';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom, map } from 'rxjs';
import { BuyForexInputDto } from './dto/buy-forex-input.dto';
import Decimal from 'decimal.js';
import { BuyForexRequest } from '@square-me/grpc';

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
                `Could not fetch wallet balance for wallet with currency: [${currency}] for user with id: [${userId}]`
              );
              throw new Error(err);
            })
          )
      )
    );

    if (walletBalanceErr) {
      throw new BadRequestException(
        'Could not find any wallet associated with specified currency. Please create a wallet first'
      );
    }

    return walletBalanceRes;
  }

  private async validateWalletSufficientFunds(
    amountToSell: string,
    walletBalance: string
  ): Promise<boolean> {
    const result = new Decimal(amountToSell).lessThanOrEqualTo(
      new Decimal(walletBalance)
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
              throw new Error(err);
            })
          )
      )
    );

    if (buyError) {
      throw new InternalServerErrorException(
        'Unable to complet purchase. Please try again later'
      );
    }

    return buyForexRes;
  }

  async buyForex(options: BuyForexServiceOptions) {
    const walletBalance = await this.checkWalletBalace(
      options.userId,
      options.baseCurrency
    );
    await this.validateWalletSufficientFunds(
      options.amount,
      walletBalance.balance
    );
    return this.processForexPurchase(options);
  }
}
