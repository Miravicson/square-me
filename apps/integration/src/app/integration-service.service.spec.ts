import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationService } from './integration.service';
import { ExchangeRateService } from './exchange-rate/exchange-rate.service';

describe('IntegrationServiceService', () => {
  let service: IntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        { provide: ExchangeRateService, useValue: {} },
      ],
    }).compile();

    service = module.get<IntegrationService>(IntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
