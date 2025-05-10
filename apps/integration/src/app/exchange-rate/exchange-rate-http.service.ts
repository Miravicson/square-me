import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExchangeRateHttpResponse } from './exchang-rate-http-response.interface';
import { tryCatch } from '@square-me/nestjs';

import { firstValueFrom } from 'rxjs';
import path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExchangeRateHttpService implements OnModuleInit {
  private apiKey!: string;
  private _exchangeUrl!: string;
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}
  onModuleInit() {
    this.apiKey = this.configService.getOrThrow('EXCHANGE_RATE_API_KEY');
  }

  private set exchangeUrlCode(exchangeCode: string) {
    this.exchangeURL = path
      .join('/v6', this.apiKey, 'latest', exchangeCode)
      .toString();
  }

  private set exchangeURL(url: string) {
    this._exchangeUrl = url;
  }

  private get exchangeURL(): string {
    return this._exchangeUrl;
  }

  async fetchExchangeRateForBaseCode(
    baseCode: string
  ): Promise<ExchangeRateHttpResponse> {
    this.exchangeUrlCode = baseCode;
    this.logger.verbose(this.exchangeURL);
    const { data, error } = await tryCatch(
      firstValueFrom(
        this.httpService.get<ExchangeRateHttpResponse>(this.exchangeURL)
      )
    );

    if (error) {
      throw error;
    }

    return data.data;
  }
}
