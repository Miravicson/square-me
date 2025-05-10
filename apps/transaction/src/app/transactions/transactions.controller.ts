import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthServiceGuard, CurrentUser } from '@square-me/auth-service';
import { BuyForexInputDto } from './dto/buy-forex-input.dto';
import { GrpcUser } from '@square-me/grpc';
import { ResponseErrorEntity, ValidationErrorEntity } from '@square-me/nestjs';
import { TransactionsService } from './transactions.service';
import { FundWalletInputDto } from './dto/fund-wallet-input.dto';
import { WithdrawWalletInputDto } from './dto/debit-wallet-input.dto';
@Controller({ version: '1', path: 'transactions' })
@UseGuards(AuthServiceGuard)
@ApiTags('Transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCookieAuth()
  @Post('buy-forex')
  async buyForex(
    @Body() inputDto: BuyForexInputDto,
    @CurrentUser() user: GrpcUser
  ) {
    const response = await this.transactionService.buyForex({
      ...inputDto,
      userId: user.id,
    });

    return response;
  }

  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCookieAuth()
  @Post('fund-wallet/:walletId')
  async fundWallet(
    @Body() inputDto: FundWalletInputDto,
    @Param('walletId') walletId: string,
    @CurrentUser() user: GrpcUser
  ) {
    const response = await this.transactionService.fundWallet(
      user.id,
      walletId,
      inputDto.amount
    );
    return response;
  }

  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCookieAuth()
  @Post('withdraw-wallet/:walletId')
  async withdrawWallet(
    @Body() inputDto: WithdrawWalletInputDto,
    @Param('walletId') walletId: string,
    @CurrentUser() user: GrpcUser
  ) {
    const response = await this.transactionService.withdrawWallet(
      user.id,
      walletId,
      inputDto.amount
    );
    return response;
  }
}
