import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginInputDto } from './dto/login-input.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ResponseErrorEntity, ValidationErrorEntity } from '@square-me/nestjs';

@Controller({ version: '1', path: 'auth' })
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
    @Body() _loginDto: LoginInputDto
  ) {
    await this.authService.login(user, response);
    return user;
  }
}
