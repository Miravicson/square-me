import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_CLIENT } from './rabbit-mq-client';
import { ClientProxy } from '@nestjs/microservices';
import { NotificationEmailEvent } from './interfaces/notification-email-event.interface';
import { firstValueFrom } from 'rxjs';
import { NotificationEmailResponse } from './interfaces/notification-email-response.interface';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_CLIENT)
    private readonly notificationClient: ClientProxy
  ) {}

  async notifyUser(data: NotificationEmailEvent) {
    await firstValueFrom(
      this.notificationClient.emit<
        NotificationEmailResponse,
        NotificationEmailEvent
      >('send_email', data)
    );
  }
}
