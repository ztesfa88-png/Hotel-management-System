import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        data: dto.data,
      },
    });

    // Send email notification (if SendGrid is configured)
    await this.sendEmailNotification(dto);

    return notification;
  }

  async findAllForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  private async sendEmailNotification(dto: CreateNotificationDto) {
    const apiKey = this.configService.get('app.sendgridApiKey');
    if (!apiKey || apiKey.startsWith('SG.your')) {
      return; // Skip if not configured
    }

    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(apiKey);

      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
        select: { email: true, firstName: true },
      });

      if (!user) return;

      await sgMail.send({
        to: user.email,
        from: {
          email: this.configService.get('app.sendgridFromEmail'),
          name: this.configService.get('app.sendgridFromName'),
        },
        subject: dto.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a56db;">${dto.title}</h2>
            <p>Dear ${user.firstName},</p>
            <p>${dto.message}</p>
            <hr />
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated message from Hotel Management System.
            </p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
    }
  }
}
