import { useState } from 'react';
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
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData } = useRevenueChart(revenuePeriod);
  const { data: occupancyData } = useOccupancyByMonth();
  const { data: recentBookings } = useBookings({ page: 1, limit: 5 });

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
      color: 'bg-[#fae4dc] text-[#f05a3a]',
      trend: null,
    },
    {
      label: 'Active Bookings',
      value: stats?.bookings.active || 0,
      sub: `${stats?.bookings.pending || 0} pending`,
      icon: CalendarCheck,
      color: 'bg-[#fae4dc] text-[#f05a3a]',
      trend: null,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(stats?.revenue.thisMonth || 0),
      sub: `${stats?.revenue.growth >= 0 ? '+' : ''}${stats?.revenue.growth || 0}% vs last month`,
      icon: DollarSign,
      color: 'bg-[#fae4dc] text-[#f05a3a]',
      trend: stats?.revenue.growth,
    },
    {
      label: 'Total Guests',
      value: stats?.guests.total || 0,
      sub: 'Registered guests',
      icon: Users,
      color: 'bg-[#fae4dc] text-[#f05a3a]',
      trend: null,
    },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="page-header gap-5 rounded-[1.75rem] bg-[#1d1b1a] px-5 py-6 text-white shadow-xl shadow-black/15 sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#ff795f]">Hotel operations · Overview</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">Welcome back. Here’s the pulse of your hotel today.</p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur">
          <Clock className="h-4 w-4 text-[#ff795f]" />
          <span>{formatDate(new Date())}</span>
        </div>
      </div>

      {/* Today's activity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-[#f1d8ce] bg-[#fff7f2] p-5 shadow-sm sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fae4dc]">
            <CheckCircle className="h-6 w-6 text-[#f05a3a]" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-[#1d1b1a]">{stats?.bookings.todayCheckIns || 0}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f05a3a]">Check-ins today</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#f1d8ce] bg-[#fff7f2] p-5 shadow-sm sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fae4dc]">
            <ArrowRight className="h-6 w-6 text-[#f05a3a]" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-[#1d1b1a]">{stats?.bookings.todayCheckOuts || 0}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f05a3a]">Check-outs today</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl border border-[#e8ddd5] bg-[#fffaf6] p-5 shadow-sm transition-transform hover:-translate-y-0.5 sm:p-6">
            <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full bg-[#fae4dc]" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#736a64]">{card.label}</p>
                <p className="mt-3 break-words text-2xl font-black tracking-tight text-[#1d1b1a] sm:text-3xl">{card.value}</p>
              </div>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="relative mt-3 flex items-center gap-1">
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
        ))}
      </div>

      {/* Occupancy rate */}
      <div className="card rounded-2xl border border-[#e8ddd5] bg-[#fffaf6] shadow-sm sm:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">At a glance</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-[#1d1b1a] sm:text-2xl">Occupancy rate</h2>
          </div>
          <span className="text-4xl font-black tracking-tight text-[#f05a3a] sm:text-5xl">
            {stats?.rooms.occupancyRate || 0}%
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-[#eee5df]">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-[#ff8067] to-[#f05a3a] transition-all duration-500"
            style={{ width: `${stats?.rooms.occupancyRate || 0}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#736a64]">
          <span>{stats?.rooms.occupied || 0} occupied</span>
          <span>{stats?.rooms.available || 0} available</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card min-w-0 rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Income trend</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[#1d1b1a]">Revenue</h2>
            </div>
            <div className="flex gap-1">
              {(['week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setRevenuePeriod(p)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    revenuePeriod === p
                      ? 'bg-[#1d1b1a] text-white shadow-sm'
                      : 'bg-[#f1efe7] text-[#666b60] hover:bg-[#e9e5d9]'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff684a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff684a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `ETB ${v}`} />
              <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), 'Revenue']} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f05a3a"
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy chart */}
        <div className="card min-w-0 rounded-2xl border border-[#e8ddd5] bg-[#fffaf6] shadow-sm sm:p-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Room utilization</p>
          <h2 className="mb-6 mt-1 text-xl font-black tracking-tight text-[#1d1b1a]">Monthly occupancy</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(occupancyData || []).slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Occupancy']} />
              <Bar dataKey="occupancyRate" fill="#f05a3a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card rounded-2xl border border-[#e8ddd5] bg-[#fffaf6] shadow-sm sm:p-0">
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-4 pt-5 sm:px-7 sm:pt-7">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Latest activity</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-[#1d1b1a] sm:text-2xl">Recent bookings</h2>
          </div>
          <Link to="/admin/bookings" className="flex items-center gap-1 text-sm font-bold text-[#f05a3a] hover:text-[#1d1b1a]">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="table-container overflow-x-auto rounded-b-2xl border-t border-[#eeeae0]">
          <table className="table min-w-[680px]">
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
              {recentBookings?.data?.map((booking: any) => (
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
              {(!recentBookings?.data || recentBookings.data.length === 0) && (
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
