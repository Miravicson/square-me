import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LocalCurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  }
);
