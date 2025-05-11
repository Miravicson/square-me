import { IsISO4217CurrencyCode, IsNotEmpty, Validate } from 'class-validator';
import { CurrencyIsSupportedRule } from '../validations/currency-is-supported.rule';

export class CreateWalletInputDto {
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  @Validate(CurrencyIsSupportedRule)
  currency: string;
}
