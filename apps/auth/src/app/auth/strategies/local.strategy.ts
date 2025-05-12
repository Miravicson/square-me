import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

import { UserEntity } from '../../users/entities/user.entity';
import { AuthStrategyName } from '@square-me/microservice-client';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.LOCAL
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string) {
    return new UserEntity(await this.authService.verifyUser(email, password));
  }
}
