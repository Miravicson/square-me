import { IsPositiveNumberString } from '@square-me/nestjs';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class FundWalletInputDto {
  @IsNumberString()
  @IsPositiveNumberString()
  @IsNotEmpty()
  amount: string;
}
