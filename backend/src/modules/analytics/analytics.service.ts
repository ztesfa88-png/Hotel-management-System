import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalBookings,
      activeBookings,
      todayCheckIns,
      todayCheckOuts,
      monthlyRevenue,
      lastMonthRevenue,
      totalGuests,
      pendingBookings,
    ] = await Promise.all([
      this.prisma.room.count({ where: { isActive: true } }),
      this.prisma.room.count({ where: { isActive: true, status: 'AVAILABLE' } }),
      this.prisma.room.count({ where: { isActive: true, status: 'OCCUPIED' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] } },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.CONFIRMED,
          checkInDate: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.CHECKED_IN,
          checkOutDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.user.count({ where: { role: 'GUEST' } }),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
    ]);

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const currentRevenue = Number(monthlyRevenue._sum.amount || 0);
    const prevRevenue = Number(lastMonthRevenue._sum.amount || 0);
    const revenueGrowth = prevRevenue > 0
      ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

    return {
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        occupancyRate,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        pending: pendingBookings,
        todayCheckIns,
        todayCheckOuts,
      },
      revenue: {
        thisMonth: currentRevenue,
        lastMonth: prevRevenue,
        growth: revenueGrowth,
      },
      guests: {
        total: totalGuests,
      },
    };
  }

  async getRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupBy = 'day';
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupBy = 'month';
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        paidAt: { gte: startDate },
      },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    });

    // Group by day or month
    const grouped: Record<string, number> = {};

    payments.forEach((payment) => {
      const date = payment.paidAt;
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      grouped[key] = (grouped[key] || 0) + Number(payment.amount);
    });

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
  }

  async getBookingTrends(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const bookings = await this.prisma.booking.findMany({
      where: { createdAt: { gte: startDate } },
      select: { status: true, createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, { count: number; revenue: number }> = {};

    bookings.forEach((booking) => {
      const key = booking.createdAt.toISOString().split('T')[0];
      if (!grouped[key]) {
        grouped[key] = { count: 0, revenue: 0 };
      }
      grouped[key].count++;
      if (booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.CHECKED_OUT) {
        grouped[key].revenue += Number(booking.totalAmount);
      }
    });

    return Object.entries(grouped).map(([date, data]) => ({ date, ...data }));
  }

  async getRoomTypeStats() {
    const roomTypes = await this.prisma.roomType.findMany({
      include: {
        rooms: {
          include: {
            bookings: {
              where: {
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] },
              },
              select: { totalAmount: true, status: true },
            },
          },
        },
      },
    });

    return roomTypes.map((rt) => {
      const totalBookings = rt.rooms.reduce((sum, room) => sum + room.bookings.length, 0);
      const totalRevenue = rt.rooms.reduce(
        (sum, room) => sum + room.bookings.reduce((s, b) => s + Number(b.totalAmount), 0),
        0,
      );

      return {
        id: rt.id,
        name: rt.name,
        basePrice: rt.basePrice,
        totalRooms: rt.rooms.length,
        totalBookings,
        totalRevenue,
      };
    });
  }

  async getOccupancyByMonth() {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [totalRooms, occupiedBookings] = await Promise.all([
        this.prisma.room.count({ where: { isActive: true } }),
        this.prisma.booking.count({
          where: {
            status: { in: [BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT, BookingStatus.CONFIRMED] },
            checkInDate: { lte: endDate },
            checkOutDate: { gte: date },
          },
        }),
      ]);

      const daysInMonth = endDate.getDate();
      const totalRoomNights = totalRooms * daysInMonth;
      const occupancyRate = totalRoomNights > 0
        ? Math.min(Math.round((occupiedBookings / totalRooms) * 100), 100)
        : 0;

      months.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        occupancyRate,
        bookings: occupiedBookings,
      });
    }

    return months;
  }
}
