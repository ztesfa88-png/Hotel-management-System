import { useState } from 'react';
import { Search, CalendarCheck, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import {
  useBookings,
  useConfirmBooking,
  useCheckIn,
  useCheckOut,
  useCancelBooking,
} from '../../hooks/useBookings';
import { formatCurrency, formatDate, getBookingStatusColor } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function BookingsManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBookings({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const confirmBooking = useConfirmBooking();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelBooking = useCancelBooking();

  const bookings = data?.data?.data || [];
  const meta = data?.data?.meta;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all hotel bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking #, guest name, room..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="table-container rounded-xl">
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => (
                    <tr key={booking.id}>
                      <td className="font-mono text-xs font-medium">{booking.bookingNumber}</td>
                      <td>
                        <div>
                          <p className="font-medium">{booking.user.firstName} {booking.user.lastName}</p>
                          <p className="text-xs text-gray-400">{booking.user.email}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">Room {booking.room.roomNumber}</p>
                          <p className="text-xs text-gray-400">{booking.room.roomType.name}</p>
                        </div>
                      </td>
                      <td>{formatDate(booking.checkInDate)}</td>
                      <td>{formatDate(booking.checkOutDate)}</td>
                      <td className="font-semibold">{formatCurrency(Number(booking.totalAmount))}</td>
                      <td>
                        <span className={getBookingStatusColor(booking.status)}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => confirmBooking.mutate(booking.id)}
                              title="Confirm"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => checkIn.mutate(booking.id)}
                              title="Check In"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => checkOut.mutate(booking.id)}
                              title="Check Out"
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <button
                              onClick={() => {
                                if (confirm('Cancel this booking?')) {
                                  cancelBooking.mutate({ id: booking.id });
                                }
                              }}
                              title="Cancel"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No bookings found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)} of {meta.total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Previous</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
