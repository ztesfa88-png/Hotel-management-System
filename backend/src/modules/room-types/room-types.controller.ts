import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('room-types')
@Controller({ path: 'room-types', version: '1' })
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all room types (public)' })
  findAll() {
    return this.roomTypesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get room type by ID (public)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomTypesService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create room type (Admin only)' })
  create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.roomTypesService.create(createRoomTypeDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update room type (Admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ) {
    return this.roomTypesService.update(id, updateRoomTypeDto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete room type (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomTypesService.remove(id);
  }
}
