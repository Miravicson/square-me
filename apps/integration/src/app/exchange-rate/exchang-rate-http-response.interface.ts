import Decimal from 'decimal.js';

export interface ExchangeRateHttpResponse {
  base_code: string;
  conversion_rates: Record<string, number>;
}

export interface ExchangeRateAdapterType {
  baseCode: string;
  conversionRates: Record<string, Decimal>;
}
