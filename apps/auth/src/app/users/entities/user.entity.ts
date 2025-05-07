export class UserEntity {
  id: string;
  email: string;

  constructor(data: Partial<UserEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
