import { Controller, UseInterceptors } from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  BuyForexRequest,
  BuyForexResponse,
  GetWalletBalanceRequest,
  GetWalletBalanceResponse,
  GrpcLoggingInterceptor,
  WalletServiceController,
  WalletServiceControllerMethods,
} from '@square-me/grpc';
import { Observable } from 'rxjs';

@Controller()
@WalletServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class WalletGrpcController implements WalletServiceController {
  constructor(private readonly walletService: WalletService) {}
  getWalletBalance(
    request: GetWalletBalanceRequest
  ):
    | Promise<GetWalletBalanceResponse>
    | Observable<GetWalletBalanceResponse>
    | GetWalletBalanceResponse {
    return this.walletService.getWalletBalance(request);
  }
  buyForex(
    request: BuyForexRequest
  ):
    | Promise<BuyForexResponse>
    | Observable<BuyForexResponse>
    | BuyForexResponse {
    return this.walletService.buyForex(request);
  }
}
