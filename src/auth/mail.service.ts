/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('MAIL_HOST'),
      port: configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: configService.get<string>('MAIL_USER'),
        pass: configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendResetMail(to: string, resetLink: string) {
    try {
      const subject = 'Reset your password';
      const html = `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Press Here </a>
        <p>If you didn’t request this, ignore this email.</p>
      `;

      const info = await this.transporter.sendMail({
        from: `"E SHOP" <${this.configService.get<string>('MAIL_USER')}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`📨 Reset mail sent to ${to}`);
      console.log(info);
      return info;
    } catch (error) {
      this.logger.error('❌ Failed to send reset email', error);
      throw error;
    }
  }
}
