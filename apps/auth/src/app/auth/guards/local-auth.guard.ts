import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthStrategyName } from '../constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategyName.LOCAL) {}
