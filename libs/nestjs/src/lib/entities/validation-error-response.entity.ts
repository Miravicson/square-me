import { ApiProperty } from '@nestjs/swagger';
export class ValidationErrorEntity {
  @ApiProperty({ type: [String] })
  message: string[];

  @ApiProperty()
  error: string;

  @ApiProperty()
  statusCode: number;

  constructor(data: Partial<ValidationErrorEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
