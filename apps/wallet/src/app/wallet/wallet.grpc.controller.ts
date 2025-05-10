import { Controller, UseInterceptors } from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  BuyForexRequest,
  BuyForexResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  FundWalletRequest,
  FundWalletResponse,
  GetAllUserWalletsRequest,
  GetAllUserWalletsResponse,
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
  fundWallet(
    request: FundWalletRequest
  ):
    | Promise<FundWalletResponse>
    | Observable<FundWalletResponse>
    | FundWalletResponse {
    return this.walletService.fundWallet(request);
  }

  createWallet(
    request: CreateWalletRequest
  ):
    | Promise<CreateWalletResponse>
    | Observable<CreateWalletResponse>
    | CreateWalletResponse {
    return this.walletService.createWallet(request);
  }
  getAllUserWallets(
    request: GetAllUserWalletsRequest
  ):
    | Promise<GetAllUserWalletsResponse>
    | Observable<GetAllUserWalletsResponse>
    | GetAllUserWalletsResponse {
    return this.walletService.getAllUserWallets(request);
  }
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
