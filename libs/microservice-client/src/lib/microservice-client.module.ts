import { DynamicModule, Module } from '@nestjs/common';
import { authGrpcClientModuleConfig } from './auth/grpc-client';
import { walletGrpcClientModuleConfig } from './wallet/grpc-client';
import { notificationRMqClientModuleConfig } from './notification/rabbit-mq-client';
import { integrationGrpcClientModuleConfig } from './integration/grpc-client';
import { ConfigModule } from '@nestjs/config';
import {
  ClientsModule,
  ClientsModuleAsyncOptions,
} from '@nestjs/microservices';

const clientModules = {
  auth: authGrpcClientModuleConfig,
  wallet: walletGrpcClientModuleConfig,
  notification: notificationRMqClientModuleConfig,
  integration: integrationGrpcClientModuleConfig,
} as const;

export type ClientModule = keyof typeof clientModules;

export interface MicroserviceClientModuleRegisterOptions {
  clients: ClientModule[];
}

@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class MicroserviceClientModule {
  static register({
    clients,
  }: MicroserviceClientModuleRegisterOptions): DynamicModule {
    const clientModuleConfigs: ClientsModuleAsyncOptions = [];
    clients.forEach((client) =>
      clientModuleConfigs.push(clientModules[client])
    );

    return {
      module: MicroserviceClientModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClientsModule.registerAsync(clientModuleConfigs),
      ],
      exports: [ClientsModule.registerAsync(clientModuleConfigs)],
    };
  }
}
