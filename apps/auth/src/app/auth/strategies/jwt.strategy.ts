import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { fromCookieAsJwt, fromGRPC } from '../jwt.cookie.extractor';
import { AuthCookieKey } from '@square-me/auth-service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookieAsJwt(AuthCookieKey.JWT_TOKEN),
        fromGRPC(),
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  validate(payload: TokenPayload): TokenPayload {
    return payload;
  }
}
