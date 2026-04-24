import { useState, useEffect } from 'react';
import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { useDashboardStats, useRevenueChart, useOccupancyByMonth } from '../../hooks/useAnalytics';
import { useBookings } from '../../hooks/useBookings';
import { formatCurrency, formatDate, getBookingStatusColor } from '../../lib/utils';
import { getSocket } from '../../lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month' | 'year'>('month');
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart(revenuePeriod);
  const { data: occupancyData } = useOccupancyByMonth();
  const { data: recentBookings } = useBookings({ page: 1, limit: 5 });

  // Real-time updates
  useEffect(() => {
    const socket = getSocket();

    socket.on('booking:new', () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    });

    socket.on('room:status-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    });

    return () => {
      socket.off('booking:new');
      socket.off('room:status-updated');
    };
  }, [queryClient]);

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Rooms',
      value: stats?.rooms.total || 0,
      sub: `${stats?.rooms.available || 0} available`,
      icon: BedDouble,
      color: 'bg-blue-50 text-blue-600',
      trend: null,
    },
    {
      label: 'Active Bookings',
      value: stats?.bookings.active || 0,
      sub: `${stats?.bookings.pending || 0} pending`,
      icon: CalendarCheck,
      color: 'bg-green-50 text-green-600',
      trend: null,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats?.revenue.thisMonth || 0),
      sub: `${stats?.revenue.growth >= 0 ? '+' : ''}${stats?.revenue.growth || 0}% vs last month`,
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
      trend: stats?.revenue.growth,
    },
    {
      label: 'Total Guests',
      value: stats?.guests.total || 0,
      sub: 'Registered guests',
      icon: Users,
      color: 'bg-orange-50 text-orange-600',
      trend: null,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Today: {formatDate(new Date())}</span>
        </div>
      </div>

      {/* Today's activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{stats?.bookings.todayCheckIns || 0}</p>
            <p className="text-sm text-blue-600">Check-ins Today</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-700">{stats?.bookings.todayCheckOuts || 0}</p>
            <p className="text-sm text-orange-600">Check-outs Today</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className={`stat-icon ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {card.trend !== null && card.trend !== undefined && (
                  card.trend >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )
                )}
                <p className={`text-xs ${card.trend !== null && card.trend !== undefined ? (card.trend >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                  {card.sub}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Occupancy rate */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-title mb-0">Occupancy Rate</h2>
          <span className="text-2xl font-bold text-primary-600">
            {stats?.rooms.occupancyRate || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats?.rooms.occupancyRate || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{stats?.rooms.occupied || 0} occupied</span>
          <span>{stats?.rooms.available || 0} available</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">Revenue</h2>
            <div className="flex gap-1">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setRevenuePeriod(p)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    revenuePeriod === p
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: any) => [`$${v}`, 'Revenue']} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy chart */}
        <div className="card">
          <h2 className="section-title">Monthly Occupancy</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(occupancyData || []).slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Occupancy']} />
              <Bar dataKey="occupancyRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check In</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings?.data?.data?.map((booking: any) => (
                <tr key={booking.id}>
                  <td className="font-mono text-xs">{booking.bookingNumber}</td>
                  <td>{booking.user.firstName} {booking.user.lastName}</td>
                  <td>Room {booking.room.roomNumber}</td>
                  <td>{formatDate(booking.checkInDate)}</td>
                  <td className="font-medium">{formatCurrency(Number(booking.totalAmount))}</td>
                  <td>
                    <span className={getBookingStatusColor(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!recentBookings?.data?.data || recentBookings.data.data.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-8">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
