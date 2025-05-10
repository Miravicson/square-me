import { Command, CommandRunner } from 'nest-commander';
import { ExchangeRateHttpService } from './exchange-rate-http.service';

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
    console.log(passedParam);
    const result = await this.exchangeRateService.fetchExchangeRateForBaseCode(
      'USD'
    );
    console.log(`Result:`, JSON.stringify(result, null, 2));
  }
}
