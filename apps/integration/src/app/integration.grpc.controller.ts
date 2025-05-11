import { Controller, UseInterceptors } from '@nestjs/common';
import {
  CheckIfCurrencySupportedRequest,
  CheckIfCurrencySupportedResponse,
  ConvertCurrencyRequest,
  ConvertCurrencyResponse,
  GrpcLoggingInterceptor,
  IntegrationServiceController,
  IntegrationServiceControllerMethods,
  SupportedCurrenciesRequest,
  SupportedCurrenciesResponse,
} from '@square-me/grpc';
import { Observable } from 'rxjs';
import { IntegrationService } from './integration.service';

@Controller()
@IntegrationServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class IntegrationGrpcController implements IntegrationServiceController {
  constructor(private readonly integrationService: IntegrationService) {}
  checkIfCurrencySupported(
    request: CheckIfCurrencySupportedRequest
  ):
    | Promise<CheckIfCurrencySupportedResponse>
    | Observable<CheckIfCurrencySupportedResponse>
    | CheckIfCurrencySupportedResponse {
    return this.integrationService.checkIfCurrencySupported(request.currency);
  }

  supportedCurrencies(
    _request: SupportedCurrenciesRequest
  ):
    | Promise<SupportedCurrenciesResponse>
    | Observable<SupportedCurrenciesResponse>
    | SupportedCurrenciesResponse {
    return this.integrationService.supportedCurrencies();
  }

  convertCurrency(
    request: ConvertCurrencyRequest
  ):
    | Promise<ConvertCurrencyResponse>
    | Observable<ConvertCurrencyResponse>
    | ConvertCurrencyResponse {
    return this.integrationService.convertCurrency(request);
  }
}
