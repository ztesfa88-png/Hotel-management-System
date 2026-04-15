import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaginationDto, paginate, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { HmsGateway } from '../../gateway/hms.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingStatus, UserRole, RoomStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: HmsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
    userId?: string,
    userRole?: UserRole,
    status?: BookingStatus,
  ) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = paginate(page, limit);

    const where: any = {};

    // Guests can only see their own bookings
    if (userRole === UserRole.GUEST) {
      where.userId = userId;
    }

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { room: { roomNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          room: { include: { roomType: true } },
          payment: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return createPaginatedResponse(bookings, total, page, limit);
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        room: { include: { roomType: true } },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Guests can only view their own bookings
    if (userRole === UserRole.GUEST && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return booking;
  }

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const { roomId, checkInDate, checkOutDate, adults, children, specialRequests } = createBookingDto;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    if (checkIn < new Date()) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Use a transaction to prevent double booking
    return this.prisma.$transaction(async (tx) => {
      // Lock the room row for update
      const room = await tx.room.findUnique({
        where: { id: roomId },
        include: { roomType: true },
      });

      if (!room || !room.isActive) {
        throw new NotFoundException(`Room with ID ${roomId} not found`);
      }

      if (room.status === RoomStatus.OUT_OF_SERVICE || room.status === RoomStatus.MAINTENANCE) {
        throw new BadRequestException(`Room ${room.roomNumber} is not available for booking`);
      }

      // Check for conflicting bookings
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          roomId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.PENDING] },
          OR: [
            {
              checkInDate: { lt: checkOut },
              checkOutDate: { gt: checkIn },
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new ConflictException(
          `Room ${room.roomNumber} is already booked for the selected dates`,
        );
      }

      // Calculate total amount
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );
      const totalAmount = Number(room.roomType.basePrice) * nights;

      // Generate booking number
      const bookingNumber = `HMS-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: adults || 1,
          children: children || 0,
          totalAmount,
          specialRequests,
          status: BookingStatus.PENDING,
          userId,
          roomId,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          room: { include: { roomType: true } },
        },
      });

      // Notify admins and staff
      this.gateway.emitNewBooking(booking);

      // Create notification for the user
      await this.notificationsService.create({
        userId,
        title: 'Booking Confirmed',
        message: `Your booking ${bookingNumber} for room ${room.roomNumber} has been created successfully.`,
        type: 'BOOKING_CREATED',
        data: { bookingId: booking.id, bookingNumber },
      });

      this.logger.log(`New booking created: ${bookingNumber}`);

      return booking;
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string, userRole: UserRole) {
    const booking = await this.findOne(id, userId, userRole);

    // Guests can only cancel their own pending bookings
    if (userRole === UserRole.GUEST) {
      if (booking.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
      if (updateBookingDto.status && updateBookingDto.status !== BookingStatus.CANCELLED) {
        throw new ForbiddenException('Guests can only cancel bookings');
      }
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        room: { include: { roomType: true } },
        payment: true,
      },
    });

    return updated;
  }

  async checkIn(id: string) {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be checked in');
    }

    const [updatedBooking] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CHECKED_IN,
          actualCheckIn: new Date(),
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          room: { include: { roomType: true } },
        },
      }),
      this.prisma.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.OCCUPIED },
      }),
    ]);

    this.gateway.emitRoomStatusUpdate(booking.roomId, RoomStatus.OCCUPIED);
    this.gateway.emitBookingStatusUpdate(id, BookingStatus.CHECKED_IN);

    await this.notificationsService.create({
      userId: booking.userId,
      title: 'Check-In Successful',
      message: `Welcome! You have successfully checked in to room ${booking.room.roomNumber}.`,
      type: 'CHECK_IN',
      data: { bookingId: id },
    });

    return updatedBooking;
  }

  async checkOut(id: string) {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException('Only checked-in bookings can be checked out');
    }

    const [updatedBooking] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CHECKED_OUT,
          actualCheckOut: new Date(),
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          room: { include: { roomType: true } },
        },
      }),
      this.prisma.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.AVAILABLE },
      }),
    ]);

    this.gateway.emitRoomStatusUpdate(booking.roomId, RoomStatus.AVAILABLE);
    this.gateway.emitBookingStatusUpdate(id, BookingStatus.CHECKED_OUT);

    await this.notificationsService.create({
      userId: booking.userId,
      title: 'Check-Out Successful',
      message: `Thank you for staying with us! You have successfully checked out.`,
      type: 'CHECK_OUT',
      data: { bookingId: id },
    });

    return updatedBooking;
  }

  async cancel(id: string, userId: string, userRole: UserRole, reason?: string) {
    const booking = await this.findOne(id, userId, userRole);

    if (userRole === UserRole.GUEST && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if ([BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED].includes(booking.status as any)) {
      throw new BadRequestException('Cannot cancel a completed or already cancelled booking');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        room: { include: { roomType: true } },
      },
    });

    // If room was occupied, make it available again
    if (booking.status === BookingStatus.CHECKED_IN) {
      await this.prisma.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.AVAILABLE },
      });
      this.gateway.emitRoomStatusUpdate(booking.roomId, RoomStatus.AVAILABLE);
    }

    this.gateway.emitBookingStatusUpdate(id, BookingStatus.CANCELLED);

    await this.notificationsService.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingNumber} has been cancelled.`,
      type: 'BOOKING_CANCELLED',
      data: { bookingId: id },
    });

    return updated;
  }

  async confirm(id: string) {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        room: { include: { roomType: true } },
      },
    });

    this.gateway.emitBookingStatusUpdate(id, BookingStatus.CONFIRMED);

    await this.notificationsService.create({
      userId: booking.userId,
      title: 'Booking Confirmed',
      message: `Your booking ${booking.bookingNumber} has been confirmed!`,
      type: 'BOOKING_CONFIRMED',
      data: { bookingId: id },
    });

    return updated;
  }
}
