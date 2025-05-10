import { IsPositiveNumberString } from '@square-me/nestjs';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class WithdrawWalletInputDto {
  @IsNumberString()
  @IsPositiveNumberString()
  @IsNotEmpty()
  amount: string;
}
