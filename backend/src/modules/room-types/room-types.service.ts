import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.roomType.findMany({
      orderBy: { basePrice: 'asc' },
      include: {
        _count: { select: { rooms: true } },
      },
    });
  }

  async findOne(id: string) {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
      include: {
        rooms: {
          where: { isActive: true },
          select: { id: true, roomNumber: true, floor: true, status: true },
        },
        _count: { select: { rooms: true } },
      },
    });

    if (!roomType) {
      throw new NotFoundException(`Room type with ID ${id} not found`);
    }

    return roomType;
  }

  async create(createRoomTypeDto: CreateRoomTypeDto) {
    const existing = await this.prisma.roomType.findUnique({
      where: { name: createRoomTypeDto.name },
    });

    if (existing) {
      throw new ConflictException(`Room type "${createRoomTypeDto.name}" already exists`);
    }

    return this.prisma.roomType.create({
      data: createRoomTypeDto,
    });
  }

  async update(id: string, updateRoomTypeDto: UpdateRoomTypeDto) {
    await this.findOne(id);

    return this.prisma.roomType.update({
      where: { id },
      data: updateRoomTypeDto,
    });
  }

  async remove(id: string) {
    const roomType = await this.findOne(id);

    const roomsCount = await this.prisma.room.count({
      where: { roomTypeId: id, isActive: true },
    });

    if (roomsCount > 0) {
      throw new ConflictException(
        `Cannot delete room type with ${roomsCount} active rooms`,
      );
    }

    return this.prisma.roomType.delete({ where: { id } });
  }
}
