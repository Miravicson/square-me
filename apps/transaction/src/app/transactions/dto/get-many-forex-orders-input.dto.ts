/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetManyForexOrdersInputDto {
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @IsNumber()
  @Type(() => Number)
  limit: number = 10;
}
