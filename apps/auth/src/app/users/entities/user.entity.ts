import { ApiHideProperty } from '@nestjs/swagger';
import { Users } from '../../../typeorm/models/users.model';

import { Exclude } from 'class-transformer';

export class UserEntity implements Users {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  @ApiHideProperty()
  @Exclude()
  password: string;
  constructor(data: Partial<UserEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
