import { Command, CommandRunner } from 'nest-commander';
import { ExchangeRateHttpService } from './exchange-rate-http.service';
import { ExchangeRateService } from './exchange-rate.service';

@Command({
  name: 'test-exchange-rate-api',
  description:
    'test-exchange-rate-api command fetches the respective exchange rates for the currency supplied',
})
export class TestExchangeRateCommand extends CommandRunner {
  constructor(private readonly exchangeRateService: ExchangeRateHttpService) {
    super();
  }

  async run(passedParam: string[]) {
    const result = await this.exchangeRateService.fetchExchangeRateForBaseCode(
      'USD'
    );
    console.log(`Result:`, JSON.stringify(result, null, 2));
  }
}

@Command({
  name: 'test-exchange-service',
  description:
    'test-exchange-rate-service test to ensure the redis service is populated accordingly',
})
export class TestExchangeRateServiceCommand extends CommandRunner {
  constructor(private readonly exchangeRateService: ExchangeRateService) {
    super();
  }

  async run(passedParam: string[]) {
    const result = await this.exchangeRateService.getExchangeRate('USD', 'NGN');
    const result2 = await this.exchangeRateService.getExchangeRate(
      'GBP',
      'NGN'
    );
    console.log(`Result: USD - NGN`, JSON.stringify(result, null, 2));
    console.log(`Result: GBP - NGN`, JSON.stringify(result2, null, 2));
  }
}
