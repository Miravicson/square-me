import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
@Controller({ version: '1', path: 'transactions' })
@UseGuards(AuthServiceGuard)
@ApiTags('Transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCookieAuth()
  @Post('/buy-forex')
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
}
