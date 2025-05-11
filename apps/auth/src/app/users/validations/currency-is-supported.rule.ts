import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  INTEGRATION_SERVICE_NAME,
  IntegrationServiceClient,
  Packages,
} from '@square-me/grpc';
import { tryCatch } from '@square-me/nestjs';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { catchError, firstValueFrom, map } from 'rxjs';

@ValidatorConstraint({ async: true })
@Injectable()
export class CurrencyIsSupportedRule
  implements ValidatorConstraintInterface, OnModuleInit
{
  private integrationService: IntegrationServiceClient;
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @Inject(Packages.INTEGRATION)
    private readonly integrationClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.getOrCreateIntegrationService();
  }

  private getOrCreateIntegrationService() {
    if (!this.integrationService) {
      this.integrationService =
        this.integrationClient.getService<IntegrationServiceClient>(
          INTEGRATION_SERVICE_NAME
        );
    }
  }

  async validate(value: string): Promise<boolean> {
    this.getOrCreateIntegrationService();
    const { data: isCurrencySupported, error } = await tryCatch(
      firstValueFrom(
        this.integrationService
          .checkIfCurrencySupported({ currency: value })
          .pipe(
            map((res) => res.isSupported),
            catchError((err) => {
              this.logger.error(err);
              throw new InternalServerErrorException(
                'Could not validate currency, try again later'
              );
            })
          )
      )
    );

    if (error) {
      throw error;
    }

    return isCurrencySupported;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.value} currency is not supported in our system`;
  }
}
