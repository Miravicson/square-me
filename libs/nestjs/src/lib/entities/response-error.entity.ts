import { ApiProperty } from '@nestjs/swagger';
export class ResponseErrorEntity {
  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;

  @ApiProperty()
  statusCode: number;

  constructor(data: Partial<ResponseErrorEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
