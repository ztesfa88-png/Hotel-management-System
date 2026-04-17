import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue chart data' })
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: false })
  getRevenueChart(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    return this.analyticsService.getRevenueChart(period);
  }

  @Get('bookings/trends')
  @ApiOperation({ summary: 'Get booking trends' })
  @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], required: false })
  getBookingTrends(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    return this.analyticsService.getBookingTrends(period);
  }

  @Get('rooms/stats')
  @ApiOperation({ summary: 'Get room type statistics' })
  getRoomTypeStats() {
    return this.analyticsService.getRoomTypeStats();
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get occupancy rate by month (last 12 months)' })
  getOccupancyByMonth() {
    return this.analyticsService.getOccupancyByMonth();
  }
}
