import { ApiProperty } from '@nestjs/swagger';
import { IsISO4217CurrencyCode } from 'class-validator';

export class CreateWalletInputDto {
  @ApiProperty({
    example: 'USD or NGN or CAD',
  })
  @IsISO4217CurrencyCode()
  currency: string;
}
