import { Controller, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationEmailEvent } from '@square-me/microservice-client';

@Controller()
export class EmailController {
  private logger = new Logger(this.constructor.name);
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('send_email')
  async handleSendEmail(@Payload() data: NotificationEmailEvent) {
    this.logger.log(`Received email request`);
    this.logger.log(data);
    return await this.emailService.sendEmail(data);
  }
}
