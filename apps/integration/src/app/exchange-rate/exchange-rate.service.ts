import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@square-me/nestjs';
import { ExchangeRateHttpService } from './exchange-rate-http.service';
import { ExchangeRateHttpResponse } from './exchang-rate-http-response.interface';

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private EXCHANGE_RATE_REDIS_KEY = 'exchange-rate';

  constructor(
    private readonly redisService: RedisService,
    private readonly exchangeHttpSvc: ExchangeRateHttpService
  ) {}

  get supportedCurrencyKey() {
    return `${this.EXCHANGE_RATE_REDIS_KEY}:supported-currencies`;
  }

  get conversionTableKey() {
    return `${this.EXCHANGE_RATE_REDIS_KEY}:conversion-table`;
  }

  getConversionKey(from: string, to: string) {
    return `${this.conversionTableKey}:${from}:${to}`;
  }

  async onModuleInit() {
    const isInitialized = await this.redisService.hasKey(
      this.supportedCurrencyKey
    );

    if (!isInitialized) {
      await this.refreshAllExchangeRates('USD');
    }
  }

  async storeAllSupportedCurrency(
    conversionRates: ExchangeRateHttpResponse['conversion_rates']
  ) {
    const supportedCurrencySet = new Set(Object.keys(conversionRates));

    await Promise.all(
      Array.from(supportedCurrencySet).map((currency) =>
        this.redisService.addToSet(this.supportedCurrencyKey, currency)
      )
    );

    return supportedCurrencySet;
  }

  async addExchangeRateDataToConversionTable(
    exchangeRateData: ExchangeRateHttpResponse,
    visitedBases = new Set<string>()
  ) {
    const conversionHash: Record<string, string> = {};
    const fromCurrency = exchangeRateData.base_code;

    // Mark current base as visited to avoid redundant reverse fetching
    visitedBases.add(fromCurrency);

    for (const [toCurrency, forwardRate] of Object.entries(
      exchangeRateData.conversion_rates
    )) {
      if (fromCurrency === toCurrency) continue;

      // Forward: from → to
      const forwardKey = this.getConversionKey(fromCurrency, toCurrency);
      conversionHash[forwardKey] = `${forwardRate}`;

      // Reverse: to → from (only if not already visited)
      if (!visitedBases.has(toCurrency)) {
        try {
          const reverseData =
            await this.exchangeHttpSvc.fetchExchangeRateForBaseCode(toCurrency);
          visitedBases.add(toCurrency);

          const reverseRate = reverseData.conversion_rates[fromCurrency];
          if (reverseRate !== undefined) {
            const reverseKey = this.getConversionKey(toCurrency, fromCurrency);
            conversionHash[reverseKey] = `${reverseRate}`;
          }
        } catch (err) {
          console.warn(`Failed to fetch reverse rate for ${toCurrency}:`, err);
        }
      }
    }

    if (Object.keys(conversionHash).length > 0) {
      await this.redisService.setHash(this.conversionTableKey, conversionHash);
    }

    return conversionHash;
  }

  async refreshAllExchangeRates(base = 'USD') {
    const initialData = await this.exchangeHttpSvc.fetchExchangeRateForBaseCode(
      base
    );

    const allCurrencies = await this.storeAllSupportedCurrency(
      initialData.conversion_rates
    );

    const visited = new Set<string>();
    await this.addExchangeRateDataToConversionTable(initialData, visited);

    const fetchAndStorePromises = Array.from(allCurrencies).map(
      async (code) => {
        const data = await this.exchangeHttpSvc.fetchExchangeRateForBaseCode(
          code
        );
        return this.addExchangeRateDataToConversionTable(data, visited);
      }
    );

    await Promise.all(fetchAndStorePromises);
  }

  async getExchangeRate(from: string, to: string): Promise<string> {
    if (from === to) return '1';

    const key = this.getConversionKey(from, to);
    const rate = await this.redisService.getHashField(
      this.conversionTableKey,
      key
    );

    return rate;
  }

  async updateExchangeRate(from: string, to: string): Promise<number> {
    const response = await this.exchangeHttpSvc.fetchExchangeRateForBaseCode(
      from
    );

    const newRate = response.conversion_rates[to];
    if (!newRate)
      throw new Error(`Exchange rate from ${from} to ${to} not found`);

    const conversionKey = this.getConversionKey(from, to);
    await this.redisService.setHashField(
      this.conversionTableKey,
      conversionKey,
      `${newRate}`
    );

    return newRate;
  }

  async getSupportedCurrencies() {
    const result = await this.redisService.getSetMembers(
      this.supportedCurrencyKey
    );

    return result;
  }

  async isCurrencySupported(currency: string) {
    const result = await this.redisService.isMemberOfSet(
      this.supportedCurrencyKey,
      currency
    );
    return result;
  }
}
