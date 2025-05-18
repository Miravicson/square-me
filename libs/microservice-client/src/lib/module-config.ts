import { ClientsProviderAsyncOptions } from '@nestjs/microservices';
import { authGrpcClientModuleConfig } from './auth/grpc-client';
import { integrationGrpcClientModuleConfig } from './integration/grpc-client';
import { notificationRMqClientModuleConfig } from './notification/rabbit-mq-client';
import { walletGrpcClientModuleConfig } from './wallet/grpc-client';
import { Provider } from '@nestjs/common';
import { NotificationService } from './notification/notification.service';

export type ClientKeys = 'auth' | 'wallet' | 'notification' | 'integration';
export interface ClientModuleOptions {
  moduleConfig: ClientsProviderAsyncOptions;
  providers: Provider[];
}

export type ClientsModule = Record<ClientKeys, ClientModuleOptions>;

export const clientModules: ClientsModule = {
  auth: { moduleConfig: authGrpcClientModuleConfig, providers: [] },
  wallet: { moduleConfig: walletGrpcClientModuleConfig, providers: [] },
  notification: {
    moduleConfig: notificationRMqClientModuleConfig,
    providers: [NotificationService],
  },
  integration: {
    moduleConfig: integrationGrpcClientModuleConfig,
    providers: [],
  },
} as const;
