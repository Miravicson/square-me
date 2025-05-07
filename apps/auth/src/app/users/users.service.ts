import { Injectable } from '@nestjs/common';

interface UserArgs {
  email?: string;
  id?: string;
}

export const dummyUser = {
  id: '123453535',
  email: 'dummy-user@company.com',
  plainPassword: 'VictorsNumber1Password@',
  password:
    '$argon2id$v=19$m=65536,t=3,p=4$WJsGhQI1xOrEzgYB2UWPrg$AgxLOmHuaAr+HpEXPkWzwZ+gjUwM7/KDxOKwdboWQw4',
};

@Injectable()
export class UsersService {
  async getUser(args: UserArgs) {
    return dummyUser; //!TODO remove dummy users
  }
}
