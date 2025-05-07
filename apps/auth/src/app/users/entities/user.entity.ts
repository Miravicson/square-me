import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;
  @ApiHideProperty()
  @Exclude()
  password: string;

  constructor(data: Partial<UserEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
