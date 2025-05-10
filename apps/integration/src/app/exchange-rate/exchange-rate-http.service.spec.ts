import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateHttpService } from './exchange-rate-http.service';

describe('ExchangeRateHttpService', () => {
  let service: ExchangeRateHttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeRateHttpService],
    }).compile();

    service = module.get<ExchangeRateHttpService>(ExchangeRateHttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
