/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
@Injectable()
export class MailConfirmationService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailConfirmationService.name);

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

  async sendOrderCreatedMail(
    to: string,
    customerName: string,
    orderId: string,
    total: number,
    items: {
      name: string;
      price: number;
      quantity: number;
    }[],
  ) {
    try {
      const subject = 'Your order has been placed 🛒';

      const orderLink = `${this.configService.get<string>(
        'FRONTEND_URL',
      )}/orders/${orderId}`;

      const itemsRows = items
        .map(
          (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
          <td style="padding:8px;border:1px solid #ddd;">$${item.price}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:8px;border:1px solid #ddd;">
            $${item.price * item.quantity}
          </td>
        </tr>
      `,
        )
        .join('');

      const html = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:650px; margin:auto; background:#fff; border-radius:8px; overflow:hidden;">
          
          <div style="background:#1e88e5; color:#fff; padding:20px; text-align:center;">
            <h2>✅ Order Confirmed</h2>
          </div>

          <div style="padding:20px; color:#333;">
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Thank you for your order! Here are your order details:</p>

            <p><strong>Order ID:</strong> ${orderId}</p>

            <table style="width:100%; border-collapse:collapse; margin-top:15px;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px;border:1px solid #ddd;">Product</th>
                  <th style="padding:8px;border:1px solid #ddd;">Price</th>
                  <th style="padding:8px;border:1px solid #ddd;">Qty</th>
                  <th style="padding:8px;border:1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <p style="margin-top:15px; font-size:16px;">
              <strong>Order Total:</strong> $${total}
            </p>

            <div style="text-align:center; margin-top:25px;">
              <a href="${orderLink}"
                 style="background:#1e88e5; color:#fff; padding:12px 20px;
                        text-decoration:none; border-radius:6px; font-weight:bold;">
                View Order Details
              </a>
            </div>

            <p style="margin-top:20px; font-size:14px; color:#555;">
              We’ll notify you when your order is shipped.
            </p>
          </div>

          <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
            © 2026 E-Shop. All rights reserved.
          </div>

        </div>
      </div>
    `;

      const info = await this.transporter.sendMail({
        from: `"E SHOP" <${this.configService.get<string>('MAIL_USER')}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`📨 Order confirmation sent to ${to}`);
      return info;
    } catch (error) {
      this.logger.error('❌ Failed to send order email', error);
      throw error;
    }
  }
}
