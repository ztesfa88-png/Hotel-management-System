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

const COLORS = ['#1d1b1a', '#f05a3a', '#ff8067', '#d17b52', '#736a64'];

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
            period === p ? 'bg-[#315b43] text-white' : 'bg-[#f1efe7] text-[#666b60] hover:bg-[#e9e5d9]'
          }`}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header gap-5 rounded-[1.75rem] bg-[#1d1b1a] px-5 py-6 text-white shadow-xl shadow-black/15 sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#ff795f]">Intelligence · Performance</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Analytics</h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">The numbers behind the guest experience.</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-1.5 backdrop-blur [&_button]:text-white/70 [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
          <PeriodSelector />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Occupancy Rate', value: `${stats?.rooms.occupancyRate || 0}%`, color: 'text-[#42443f]' },
          { label: 'Monthly Revenue', value: formatCurrency(stats?.revenue.thisMonth || 0), color: 'text-[#315b43]' },
          { label: 'Active Bookings', value: stats?.bookings.active || 0, color: 'text-[#db4930]' },
          { label: 'Revenue Growth', value: `${stats?.revenue.growth >= 0 ? '+' : ''}${stats?.revenue.growth || 0}%`, color: stats?.revenue.growth >= 0 ? 'text-[#315b43]' : 'text-red-600' },
        ].map((item) => (
          <div key={item.label} className="relative overflow-hidden rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] p-5 shadow-sm sm:p-6">
            <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-[#1d1b1a] via-[#f05a3a] to-[#ff8067]" />
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#736a64]">{item.label}</p>
            <p className={`mt-4 break-words text-2xl font-black tracking-tight sm:text-3xl ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card min-w-0 rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Income trend</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-[#1d1b1a] sm:text-2xl">Revenue over time</h2>
        </div>
        {revenueLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff684a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff684a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `ETB ${v}`} />
              <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#f05a3a" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Booking trends + Room type distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card min-w-0 rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm sm:p-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Demand</p>
          <h2 className="mb-5 mt-1 text-xl font-black tracking-tight text-[#1d1b1a]">Booking trends</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bookingTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f05a3a" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card min-w-0 rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm sm:p-7">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Mix</p>
          <h2 className="mb-5 mt-1 text-xl font-black tracking-tight text-[#1d1b1a]">Revenue by room type</h2>
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
            <div className="flex h-48 items-center justify-center rounded-xl bg-[#f7f1ec] text-sm font-medium text-[#736a64]">No data available</div>
          )}
        </div>
      </div>

      {/* Occupancy by month */}
      <div className="card min-w-0 rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm sm:p-7">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Capacity planning</p>
        <h2 className="mb-5 mt-1 text-xl font-black tracking-tight text-[#1d1b1a]">Monthly occupancy · last 12 months</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={occupancyData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
            <Tooltip formatter={(v: any) => [`${v}%`, 'Occupancy Rate']} />
            <Bar dataKey="occupancyRate" fill="#f05a3a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Room type performance table */}
      {roomTypeStats && roomTypeStats.length > 0 && (
        <div className="card overflow-hidden rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] p-0 shadow-sm">
          <div className="border-b border-[#eeeae0] px-5 py-5 sm:px-7">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#f05a3a]">Portfolio detail</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-[#1d1b1a] sm:text-2xl">Room type performance</h2>
          </div>
          <div className="table-container overflow-x-auto">
            <table className="table min-w-[760px]">
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
                    <td className="font-semibold text-[#f05a3a]">{formatCurrency(rt.totalRevenue)}</td>
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
