import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';

export class BuyForexInputDto {
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  baseCurrency: string;

  @IsNotEmpty()
  @IsISO4217CurrencyCode({})
  targetCurrency: string;

  @IsNumberString()
  amount: string;
}
