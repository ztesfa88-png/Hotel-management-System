import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingStatus, UserRole } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'status', enum: BookingStatus, required: false })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status: BookingStatus,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.findAll(paginationDto, userId, userRole, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.findOne(id, userId, userRole);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.update(id, updateBookingDto, userId, userRole);
  }

  @Post(':id/confirm')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm a booking (Admin/Staff only)' })
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.confirm(id);
  }

  @Post(':id/check-in')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check in a guest (Admin/Staff only)' })
  checkIn(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.checkIn(id);
  }

  @Post(':id/check-out')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check out a guest (Admin/Staff only)' })
  checkOut(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.checkOut(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.bookingsService.cancel(id, userId, userRole, reason);
  }
}
