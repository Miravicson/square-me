import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthServiceGuard, CurrentUser } from '@square-me/microservice-client';
import { BuyForexInputDto } from './dto/buy-forex-input.dto';
import { GrpcUser } from '@square-me/grpc';
import { ResponseErrorEntity, ValidationErrorEntity } from '@square-me/nestjs';
import { TransactionsService } from './transactions.service';
import { FundWalletInputDto } from './dto/fund-wallet-input.dto';
import { WithdrawWalletInputDto } from './dto/debit-wallet-input.dto';
import { GetManyForexOrdersInputDto } from './dto/get-many-forex-orders-input.dto';
import { ApiPaginatedResponse } from './entities/api-paginated-response';
import { ForexOrderEntity } from './entities/forex-order.entity';
import { ForexTransactionEntity } from './entities/forex-transaction.entity';
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
      userEmail: user.email,
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
      user,
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
      user,
      walletId,
      inputDto.amount
    );
    return response;
  }

  @ApiCookieAuth()
  @ApiPaginatedResponse(ForexOrderEntity)
  @Get('forex-orders')
  async getManyForexOrder(
    @CurrentUser() user: GrpcUser,
    @Query() inputDto: GetManyForexOrdersInputDto
  ) {
    return this.transactionService.getManyForexOrder(user.id, inputDto);
  }

  @ApiCookieAuth()
  @ApiPaginatedResponse(ForexTransactionEntity)
  @Get('forex-transactions')
  async getManyForexTransactions(
    @CurrentUser() user: GrpcUser,
    @Query() inputDto: GetManyForexOrdersInputDto
  ) {
    return this.transactionService.getManyForexTransactions(user.id, inputDto);
  }
}
