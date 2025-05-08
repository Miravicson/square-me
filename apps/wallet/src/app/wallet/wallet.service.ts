import { Injectable, Logger } from '@nestjs/common';
import {
  BuyForexResponse,
  GetWalletBalanceRequest,
  GetWalletBalanceResponse,
} from '@square-me/grpc';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(this.constructor.name);

  async getWalletBalance(
    request: GetWalletBalanceRequest
  ): Promise<GetWalletBalanceResponse> {
    this.logger.verbose('Getting wallet balance for wallet');

    return {
      amount: '200',
      currency: 'USD',
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
