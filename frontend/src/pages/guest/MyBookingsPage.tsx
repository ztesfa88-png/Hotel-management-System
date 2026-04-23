import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, ChevronRight, Plus } from 'lucide-react';
import { useBookings, useCancelBooking } from '../../hooks/useBookings';
import { formatCurrency, formatDate, getBookingStatusColor, calculateNights } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MyBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBookings({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const cancelBooking = useCancelBooking();

  const bookings = data?.data?.data || [];
  const meta = data?.data?.meta;

  const handleCancel = (id: string, bookingNumber: string) => {
    if (confirm(`Cancel booking ${bookingNumber}?`)) {
      cancelBooking.mutate({ id });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your hotel reservations</p>
        </div>
        <Link to="/rooms" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">Start by searching for available rooms</p>
          <Link to="/rooms" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => {
            const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
            return (
              <div key={booking.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-700">
                        {booking.bookingNumber}
                      </span>
                      <span className={getBookingStatusColor(booking.status)}>
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">
                      {booking.room.roomType.name} — Room {booking.room.roomNumber}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Check in: <strong className="text-gray-700">{formatDate(booking.checkInDate)}</strong></span>
                      <span>Check out: <strong className="text-gray-700">{formatDate(booking.checkOutDate)}</strong></span>
                      <span>{nights} night{nights > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">
                        {formatCurrency(Number(booking.totalAmount))}
                      </p>
                      {booking.payment && (
                        <span className={`text-xs ${booking.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                          {booking.payment.status === 'COMPLETED' ? 'Paid' : 'Payment pending'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="btn-secondary text-sm py-1.5 flex items-center gap-1"
                      >
                        Details <ChevronRight className="w-3 h-3" />
                      </Link>
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking.id, booking.bookingNumber)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
