import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { PaginationDto, paginate, createPaginatedResponse } from '../../common/dto/pagination.dto';
import { HmsGateway } from '../../gateway/hms.gateway';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: HmsGateway,
  ) {}

  async findAll(paginationDto: PaginationDto, status?: RoomStatus, roomTypeId?: string) {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const { skip, take } = paginate(page, limit);

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (roomTypeId) where.roomTypeId = roomTypeId;

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.roomNumber = 'asc';
    }

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { roomType: true },
      }),
      this.prisma.room.count({ where }),
    ]);

    return createPaginatedResponse(rooms, total, page, limit);
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
            checkOutDate: { gte: new Date() },
          },
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            bookingNumber: true,
          },
          orderBy: { checkInDate: 'asc' },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async searchAvailable(searchDto: SearchRoomsDto) {
    const { checkIn, checkOut, roomTypeId, minPrice, maxPrice, guests } = searchDto;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    if (checkInDate < new Date()) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Find rooms that are NOT booked during the requested period
    const bookedRoomIds = await this.prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
        OR: [
          {
            checkInDate: { lt: checkOutDate },
            checkOutDate: { gt: checkInDate },
          },
        ],
      },
      select: { roomId: true },
    });

    const bookedIds = bookedRoomIds.map((b) => b.roomId);

    const where: any = {
      isActive: true,
      status: RoomStatus.AVAILABLE,
      id: { notIn: bookedIds },
    };

    if (roomTypeId) where.roomTypeId = roomTypeId;
    if (guests) where.roomType = { maxGuests: { gte: guests } };

    if (minPrice || maxPrice) {
      where.roomType = {
        ...where.roomType,
        basePrice: {},
      };
      if (minPrice) where.roomType.basePrice.gte = minPrice;
      if (maxPrice) where.roomType.basePrice.lte = maxPrice;
    }

    const rooms = await this.prisma.room.findMany({
      where,
      include: { roomType: true },
      orderBy: { roomType: { basePrice: 'asc' } },
    });

    // Calculate total price for the stay
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return rooms.map((room) => ({
      ...room,
      nights,
      totalPrice: Number(room.roomType.basePrice) * nights,
    }));
  }

  async create(createRoomDto: CreateRoomDto) {
    const existing = await this.prisma.room.findUnique({
      where: { roomNumber: createRoomDto.roomNumber },
    });

    if (existing) {
      throw new ConflictException(`Room number ${createRoomDto.roomNumber} already exists`);
    }

    const roomType = await this.prisma.roomType.findUnique({
      where: { id: createRoomDto.roomTypeId },
    });

    if (!roomType) {
      throw new NotFoundException(`Room type with ID ${createRoomDto.roomTypeId} not found`);
    }

    const room = await this.prisma.room.create({
      data: createRoomDto,
      include: { roomType: true },
    });

    this.gateway.emitRoomStatusUpdate(room.id, room.status);

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    await this.findOne(id);

    const room = await this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: { roomType: true },
    });

    if (updateRoomDto.status) {
      this.gateway.emitRoomStatusUpdate(room.id, room.status);
    }

    return room;
  }

  async updateStatus(id: string, status: RoomStatus) {
    await this.findOne(id);

    const room = await this.prisma.room.update({
      where: { id },
      data: { status },
      include: { roomType: true },
    });

    this.gateway.emitRoomStatusUpdate(room.id, room.status);

    return room;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.room.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addImages(id: string, imageUrls: string[]) {
    const room = await this.findOne(id);

    return this.prisma.room.update({
      where: { id },
      data: { images: [...room.images, ...imageUrls] },
      include: { roomType: true },
    });
  }
}
