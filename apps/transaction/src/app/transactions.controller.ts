import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthServiceGuard } from '@square-me/auth-service';

@Controller({ version: '1', path: 'transactions' })
@UseGuards(AuthServiceGuard)
@ApiTags('Transactions')
export class TransactionsController {
  @Post('/buy-forex')
  async buyForex() {
    return {
      message: 'successful',
    };
  }
}
