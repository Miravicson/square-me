import { CreateWalletResponse } from '@square-me/grpc';

export class UserWalletEntity implements CreateWalletResponse {
  userId: string;
  walletId: string;
  currency: string;
  balance: string;

  constructor(data: Partial<UserWalletEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }

  static many(entities: Partial<UserWalletEntity>[]) {
    return entities.map((entity) => new UserWalletEntity(entity));
  }
}
