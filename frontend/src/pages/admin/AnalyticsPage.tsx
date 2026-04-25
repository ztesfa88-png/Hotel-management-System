import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  useRevenueChart,
  useBookingTrends,
  useRoomTypeStats,
  useOccupancyByMonth,
  useDashboardStats,
} from '../../hooks/useAnalytics';
import { formatCurrency } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: stats } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueChart(period);
  const { data: bookingTrends } = useBookingTrends(period);
  const { data: roomTypeStats } = useRoomTypeStats();
  const { data: occupancyData } = useOccupancyByMonth();

  const PeriodSelector = () => (
    <div className="flex gap-1">
      {(['week', 'month', 'year'] as const).map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            period === p ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Hotel performance insights and trends</p>
        </div>
        <PeriodSelector />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Occupancy Rate', value: `${stats?.rooms.occupancyRate || 0}%`, color: 'text-blue-600' },
          { label: 'Monthly Revenue', value: formatCurrency(stats?.revenue.thisMonth || 0), color: 'text-green-600' },
          { label: 'Active Bookings', value: stats?.bookings.active || 0, color: 'text-purple-600' },
          { label: 'Revenue Growth', value: `${stats?.revenue.growth >= 0 ? '+' : ''}${stats?.revenue.growth || 0}%`, color: stats?.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600' },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">Revenue Over Time</h2>
        </div>
        {revenueLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `ETB ${v}`} />
              <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Booking trends + Room type distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title">Booking Trends</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="section-title">Revenue by Room Type</h2>
          {roomTypeStats && roomTypeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={roomTypeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="totalRevenue"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {roomTypeStats.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data available</div>
          )}
        </div>
      </div>

      {/* Occupancy by month */}
      <div className="card">
        <h2 className="section-title">Monthly Occupancy Rate (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={occupancyData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip formatter={(v: any) => [`${v}%`, 'Occupancy Rate']} />
            <Bar dataKey="occupancyRate" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Room type performance table */}
      {roomTypeStats && roomTypeStats.length > 0 && (
        <div className="card p-0">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="section-title mb-0">Room Type Performance</h2>
          </div>
          <div className="table-container rounded-b-xl">
            <table className="table">
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Total Rooms</th>
                  <th>Total Bookings</th>
                  <th>Total Revenue</th>
                  <th>Avg Revenue/Booking</th>
                </tr>
              </thead>
              <tbody>
                {roomTypeStats.map((rt: any) => (
                  <tr key={rt.id}>
                    <td className="font-medium">{rt.name}</td>
                    <td>{rt.totalRooms}</td>
                    <td>{rt.totalBookings}</td>
                    <td className="font-semibold text-green-600">{formatCurrency(rt.totalRevenue)}</td>
                    <td>{rt.totalBookings > 0 ? formatCurrency(rt.totalRevenue / rt.totalBookings) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
