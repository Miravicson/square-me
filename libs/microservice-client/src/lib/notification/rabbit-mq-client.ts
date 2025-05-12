import { ConfigService } from '@nestjs/config';
import {
  ClientsProviderAsyncOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';

export function createNotificationRMqClient(
  url: string,
  queueName: string
): MicroserviceOptions {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue: queueName,
      queueOptions: {
        durable: false,
      },
    },
  };
}

export const NOTIFICATION_CLIENT = Symbol('NOTIFICATION_CLIENT');

export const notificationRMqClientModuleConfig: ClientsProviderAsyncOptions = {
  name: NOTIFICATION_CLIENT,
  useFactory: (configService: ConfigService) =>
    createNotificationRMqClient(
      configService.getOrThrow<string>('RABBIT_MQ_URL'),
      configService.getOrThrow<string>('RABBIT_MQ_QUEUE_NAME')
    ),
  inject: [ConfigService],
} as ClientsProviderAsyncOptions;
