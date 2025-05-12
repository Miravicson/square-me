import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthStrategyName } from '@square-me/microservice-client';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategyName.LOCAL) {}
