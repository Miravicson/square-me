import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  Packages,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@square-me/grpc';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthCookieKey } from '../constants';

@Injectable()
export class AuthServiceGuard implements CanActivate, OnModuleInit {
  private authService: AuthServiceClient;
  private readonly logger = new Logger(this.constructor.name);
  constructor(@Inject(Packages.AUTH) private readonly client: ClientGrpc) {}
  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const token = this.getRequest(context).cookies[AuthCookieKey.JWT_TOKEN];

    if (!token) {
      return false;
    }

    return this.authService.authenticate({ token }).pipe(
      map((res) => {
        this.getRequest(context).user = res;
        return true;
      }),
      catchError((err) => {
        this.logger.error(err);
        return of(false);
      })
    );
  }

  private getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}
