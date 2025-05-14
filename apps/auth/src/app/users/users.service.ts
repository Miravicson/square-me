import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../typeorm/models/users.model';
import { FindOneOptions, Repository } from 'typeorm';
import {
  INTEGRATION_SERVICE_NAME,
  IntegrationServiceClient,
  Packages,
  WALLET_SERVICE_NAME,
  WalletServiceClient,
} from '@square-me/grpc';
import { ClientGrpc } from '@nestjs/microservices';
import { tryCatch } from '@square-me/nestjs';
import { catchError, firstValueFrom, map } from 'rxjs';
import { status } from '@grpc/grpc-js';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  private walletService: WalletServiceClient;
  private integrationService: IntegrationServiceClient;
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @Inject(Packages.WALLET) private readonly walletClient: ClientGrpc,
    @Inject(Packages.INTEGRATION)
    private readonly integrationClient: ClientGrpc
  ) {}

  onModuleInit() {
    this.walletService =
      this.walletClient.getService<WalletServiceClient>(WALLET_SERVICE_NAME);
    this.integrationService =
      this.integrationClient.getService<IntegrationServiceClient>(
        INTEGRATION_SERVICE_NAME
      );
  }

  async createUserWallet(userId: string, currency: string) {
    const { data: createWalletResponse, error: createWalletErr } =
      await tryCatch(
        firstValueFrom(
          this.walletService.createWallet({ currency, userId }).pipe(
            map((res) => res),
            catchError((err) => {
              throw new Error(err);
            })
          )
        )
      );

    if (createWalletErr) {
      this.logger.error(createWalletErr);
      throw new InternalServerErrorException('Something wrong happened');
    }

    return createWalletResponse;
  }

  async getAllUserWallets(userId: string) {
    const { data: response, error } = await tryCatch(
      firstValueFrom(
        this.walletService.getAllUserWallets({ userId }).pipe(
          map((res) => res),
          catchError((err) => {
            this.logger.error(err);
            if (err.code === status.NOT_FOUND) {
              throw new NotFoundException(err.message);
            }
            throw new InternalServerErrorException(err);
          })
        )
      )
    );

    if (error) {
      throw error;
    }

    return response.wallets;
  }

  async getUser(where: FindOneOptions<Users>['where']) {
    return this.userRepository.findOneOrFail({ where });
  }

  async createBasicUserOrFail(email: string, password: string) {
    const userExists = await this.userRepository.exists({ where: { email } });

    if (userExists) {
      this.logger.error(`The user with email: ${email} already exists`);
      throw new Error('user already exists');
    }

    const user = await this.userRepository.create({ email, password });
    await this.userRepository.save(user);
    return user;
  }

  async getSupportedCurrencies() {
    if (!this.integrationService) {
      this.integrationService =
        this.integrationClient.getService<IntegrationServiceClient>(
          INTEGRATION_SERVICE_NAME
        );
    }

    const { data: currencies, error } = await tryCatch(
      firstValueFrom(
        this.integrationService.supportedCurrencies({}).pipe(
          map((res) => res.currencies),
          catchError((err) => {
            this.logger.error(err);
            throw new InternalServerErrorException(
              'Service unavailable. Please try again later'
            );
          })
        )
      )
    );

    if (error) {
      throw error;
    }

    currencies.sort((a, b) =>
      a.localeCompare(b, 'en', { sensitivity: 'base' })
    );

    return currencies;
  }
}
