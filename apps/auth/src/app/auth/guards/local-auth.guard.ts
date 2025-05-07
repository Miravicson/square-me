import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthStrategyName } from '@square-me/auth-service';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategyName.LOCAL) {}
