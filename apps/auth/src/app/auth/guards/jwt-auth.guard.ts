import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthStrategyName } from '@square-me/microservice-client';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategyName.JWT) {}
