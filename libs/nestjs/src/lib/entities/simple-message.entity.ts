import { ApiProperty } from '@nestjs/swagger';

export class SimpleMessageEntity {
  @ApiProperty({ description: 'Message indicating what happened' })
  message: string;

  @ApiProperty({
    description: 'Indicates if action happened successfully or not',
  })
  success: boolean;

  constructor(data: Partial<SimpleMessageEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
