import { Injectable } from '@nestjs/common';

import { ExchangeRateService } from './exchange-rate/exchange-rate.service';
import {
  ConvertCurrencyRequest,
  ConvertCurrencyResponse,
} from '@square-me/grpc';

@Injectable()
export class IntegrationService {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  async convertCurrency(
    request: ConvertCurrencyRequest
  ): Promise<ConvertCurrencyResponse> {
    const exchangeRate = await this.exchangeRateService.getExchangeRate(
      request.from,
      request.to
    );

    return {
      exchangeRate,
      from: request.from,
      to: request.to,
    };
  }
}
