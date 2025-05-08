import { Controller, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  AuthenticateRequest,
  AuthServiceController,
  AuthServiceControllerMethods,
  GrpcLoggingInterceptor,
  GrpcUser,
} from '@square-me/grpc';
import { Observable } from 'rxjs';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
@AuthServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class AuthGrpcController implements AuthServiceController {
  private readonly logger = new Logger(this.constructor.name);
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  authenticate(
    request: AuthenticateRequest & { user: TokenPayload }
  ): Promise<GrpcUser> | Observable<GrpcUser> | GrpcUser {
    return this.usersService.getUser({ id: request.user.userId });
  }
}
