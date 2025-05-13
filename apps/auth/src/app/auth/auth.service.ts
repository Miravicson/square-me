import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interface';
import { CookieOptions, Response } from 'express';
import { hash, verify } from 'argon2';

import { UserEntity } from '../users/entities/user.entity';
import { AuthCookieKey } from '@square-me/microservice-client';
import { SignUpInputDto } from './dto/signup-input.dto';
import { tryCatch } from '@square-me/nestjs';

interface SetJWTCookieOptions {
  key: string;
  value: string;
  expiry?: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  private createCookieExpiry(): Date {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getTime() +
        parseInt(this.configService.getOrThrow('JWT_EXPIRATION_MS'))
    );

    return expires;
  }

  private setJWTCookie(
    { key, value, expiry = this.createCookieExpiry() }: SetJWTCookieOptions,
    response: Response
  ) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiry,
    };
    response.cookie(key, value, cookieOptions);
  }

  async signup(signupDto: SignUpInputDto, response: Response) {
    this.logger.log(`Signing up user`);
    const { data: user, error } = await tryCatch(
      this.usersService.createBasicUserOrFail(
        signupDto.email,
        await hash(signupDto.password)
      )
    );
    if (error !== null) {
      this.logger.error(error, error.stack);
      throw new BadRequestException(
        'Could not sign you up, check your credentials and try again'
      );
    }
    await this.login(user, response);
    return user;
  }

  async login(user: UserEntity, response: Response) {
    const accessToken = this.jwtService.sign({
      userId: user.id,
    } satisfies TokenPayload);

    this.setJWTCookie(
      { key: AuthCookieKey.JWT_TOKEN, value: accessToken },
      response
    );

    return user;
  }

  async verifyUser(email: string, password: string) {
    const { data: user, error: getUserError } = await tryCatch(
      this.usersService.getUser({
        email,
      })
    );

    if (getUserError != null) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    const { error: authErr } = await tryCatch(verify(user.password, password));

    if (authErr != null) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    return user;
  }
}
