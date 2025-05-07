import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interface';
import { CookieOptions, Response } from 'express';
import { verify } from 'argon2';

import { UserEntity } from '../users/entities/user.entity';
import { AuthCookieKey } from '@square-me/auth-service';

interface SetJWTCookieOptions {
  key: string;
  value: string;
  expiry?: Date;
}

@Injectable()
export class AuthService {
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
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await verify(user.password, password);

      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}
