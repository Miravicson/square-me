import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumberString,
  Validate,
} from 'class-validator';
import { CurrencyIsSupportedRule } from '../validations/currency-is-supported.rule';

export class BuyForexInputDto {
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  @Validate(CurrencyIsSupportedRule)
  baseCurrency: string;

  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  @Validate(CurrencyIsSupportedRule)
  targetCurrency: string;

  @IsNumberString()
  amount: string;
}
