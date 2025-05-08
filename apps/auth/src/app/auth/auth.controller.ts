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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginInputDto } from './dto/login-input.dto';
import { UserEntity } from '../users/entities/user.entity';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ResponseErrorEntity, ValidationErrorEntity } from '@square-me/nestjs';
import { SignUpInputDto } from './dto/signup-input.dto';
import { LocalCurrentUser } from './decorators/local-current-user.dectorator';

@Controller({ version: '1', path: 'auth' })
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCreatedResponse({ type: UserEntity })
  async signup(
    @Res({ passthrough: true }) response: Response,
    @Body()
    signupDto: SignUpInputDto
  ) {
    const result = await this.authService.signup(signupDto, response);
    return new UserEntity(result);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  async login(
    @LocalCurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
    @Body() _loginDto: LoginInputDto
  ) {
    await this.authService.login(user, response);
    return user;
  }
}
