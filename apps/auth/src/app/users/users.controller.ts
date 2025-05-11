import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@square-me/auth-service';
import { TokenPayload } from '../auth/interfaces/token-payload.interface';
import { ResponseErrorEntity, ValidationErrorEntity } from '@square-me/nestjs';
import { CreateWalletInputDto } from './dto/create-wallet-input.dto';
import { UserWalletEntity } from './entities/user-wallet.entity';

@Controller({ version: '1', path: 'users' })
@ApiTags('Users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('wallets')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCreatedResponse({ type: UserWalletEntity })
  async createUserWallet(
    @CurrentUser() user: TokenPayload,
    @Body() inputDto: CreateWalletInputDto
  ) {
    const result = await this.userService.createUserWallet(
      user.userId,
      inputDto.currency
    );

    return new UserWalletEntity(result);
  }

  @Get('wallets')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserWalletEntity, isArray: true })
  @ApiInternalServerErrorResponse({ type: ResponseErrorEntity })
  async getAllUserWallets(@CurrentUser() user: TokenPayload) {
    const result = await this.userService.getAllUserWallets(user.userId);
    return UserWalletEntity.many(result);
  }

  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { type: 'string' },
      nullable: false,
    },
  })
  @Get('exchage-rate/supported-currencies')
  async getSupportedCurrencies() {
    return this.userService.getSupportedCurrencies();
  }
}
