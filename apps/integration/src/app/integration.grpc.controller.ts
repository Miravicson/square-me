import { Controller, UseInterceptors } from '@nestjs/common';
import {
  ConvertCurrencyRequest,
  ConvertCurrencyResponse,
  GrpcLoggingInterceptor,
  IntegrationServiceController,
  IntegrationServiceControllerMethods,
} from '@square-me/grpc';
import { Observable } from 'rxjs';
import { IntegrationService } from './integration.service';

@Controller()
@IntegrationServiceControllerMethods()
@UseInterceptors(GrpcLoggingInterceptor)
export class IntegrationGrpcController implements IntegrationServiceController {
  constructor(private readonly integrationService: IntegrationService) {}

  convertCurrency(
    request: ConvertCurrencyRequest
  ):
    | Promise<ConvertCurrencyResponse>
    | Observable<ConvertCurrencyResponse>
    | ConvertCurrencyResponse {
    return this.integrationService.convertCurrency(request);
  }
}
