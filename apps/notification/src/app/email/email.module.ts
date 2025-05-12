import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { LoggerModule } from '@square-me/nestjs';
import { EmailController } from './email.controller';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule,
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const transport: MailerOptions['transport'] = {
          host: configService.getOrThrow<string>('EMAIL_HOST'),
          port: configService.getOrThrow<string>('EMAIL_PORT'),
        };

        if (configService.get(`NODE_ENV`) === 'production') {
          transport['auth'] = {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          };
        }
        const mailerModuleConfig: MailerOptions = {
          transport,
          defaults: {
            from: configService.get<string>('EMAIL_FROM'),
          },
          preview: true,
        };
        return mailerModuleConfig;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
