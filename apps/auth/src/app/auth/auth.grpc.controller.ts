import { Controller, Logger } from '@nestjs/common';
import {
  AuthenticateRequest,
  AuthServiceController,
  AuthServiceControllerMethods,
  GrpcUser,
} from '@square-me/grpc';
import { Observable } from 'rxjs';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UsersService } from '../users/users.service';

@Controller()
@AuthServiceControllerMethods()
export class AuthGrpcController implements AuthServiceController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly usersService: UsersService) {}

  authenticate(
    request: AuthenticateRequest & { user: TokenPayload }
  ): Promise<GrpcUser> | Observable<GrpcUser> | GrpcUser {
    return this.usersService.getUser({ id: request.user.userId });
  }
}
