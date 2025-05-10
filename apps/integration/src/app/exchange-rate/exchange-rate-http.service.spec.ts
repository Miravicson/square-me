import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeRateHttpService } from './exchange-rate-http.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('ExchangeRateHttpService', () => {
  let service: ExchangeRateHttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRateHttpService,
        { provide: HttpService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<ExchangeRateHttpService>(ExchangeRateHttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
