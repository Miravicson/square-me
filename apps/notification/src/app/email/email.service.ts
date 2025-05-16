import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  NotificationEmailEvent,
  NotificationEmailResponse,
} from '@square-me/microservice-client';

@Injectable()
export class EmailService {
  private logger = new Logger(this.constructor.name);
  constructor(private readonly mailerService: MailerService) {}
  async sendEmail(
    data: NotificationEmailEvent
  ): Promise<NotificationEmailResponse> {
    this.logger.log(`About consuming email request: ${JSON.stringify(data)}`);

    await this.mailerService.sendMail({
      to: data.to,
      html: data.html,
      text: data.text,
      subject: data.subject,
    });

    return {
      message: `Email has been queued to be sent`,
    };
  }
}
