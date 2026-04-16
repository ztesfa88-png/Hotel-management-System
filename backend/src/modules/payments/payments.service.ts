import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { HmsGateway } from '../../gateway/hms.gateway';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: HmsGateway,
  ) {
    const stripeKey = this.configService.get('stripe.secretKey');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    }
  }

  async createCheckoutSession(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        room: { include: { roomType: true } },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    if (booking.payment?.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Booking is already paid');
    }

    if (!this.stripe) {
      throw new BadRequestException('Payment service not configured');
    }

    const nights = Math.ceil(
      (booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${booking.room.roomType.name} - Room ${booking.room.roomNumber}`,
              description: `${nights} night(s) stay from ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()}`,
            },
            unit_amount: Math.round(Number(booking.totalAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('app.frontendUrl')}/bookings/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('app.frontendUrl')}/bookings/${bookingId}`,
      customer_email: booking.user.email,
      metadata: {
        bookingId,
        userId,
        bookingNumber: booking.bookingNumber,
      },
    });

    // Create or update payment record
    const invoiceNumber = `INV-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalAmount,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        method: 'STRIPE',
        stripeSessionId: session.id,
        invoiceNumber,
      },
      update: {
        stripeSessionId: session.id,
        status: PaymentStatus.PENDING,
      },
    });

    return { sessionId: session.id, sessionUrl: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('stripe.webhookSecret');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(session: Stripe.Checkout.Session) {
    const { bookingId, userId } = session.metadata;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { bookingId },
        data: {
          status: PaymentStatus.COMPLETED,
          stripePaymentId: session.payment_intent as string,
          paidAt: new Date(),
        },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
      });
    });

    await this.notificationsService.create({
      userId,
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully. Your booking is confirmed!',
      type: 'PAYMENT_SUCCESS',
      data: { bookingId },
    });

    this.gateway.emitPaymentUpdate(bookingId, PaymentStatus.COMPLETED);
    this.logger.log(`Payment completed for booking: ${bookingId}`);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
      include: { booking: true },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      await this.notificationsService.create({
        userId: payment.booking.userId,
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        type: 'PAYMENT_FAILED',
        data: { bookingId: payment.bookingId },
      });

      this.gateway.emitPaymentUpdate(payment.bookingId, PaymentStatus.FAILED);
    }
  }

  async getPaymentByBooking(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            room: { include: { roomType: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment for booking ${bookingId} not found`);
    }

    return payment;
  }

  async processRefund(bookingId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (!this.stripe || !payment.stripePaymentId) {
      throw new BadRequestException('Cannot process refund');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
      reason: 'requested_by_customer',
    });

    const updated = await this.prisma.payment.update({
      where: { bookingId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundAmount: payment.amount,
        refundReason: reason || 'Booking cancelled',
      },
    });

    this.logger.log(`Refund processed for booking: ${bookingId}`);

    return updated;
  }

  async getAllPayments(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
              room: { include: { roomType: true } },
            },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
