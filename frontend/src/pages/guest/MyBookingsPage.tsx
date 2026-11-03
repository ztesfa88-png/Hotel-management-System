import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarCheck, ChevronRight, Plus } from 'lucide-react';
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

  const bookings = data?.data || [];
  const meta = data?.meta;

  const handleCancel = (id: string, bookingNumber: string) => {
    if (confirm(`Cancel booking ${bookingNumber}?`)) {
      cancelBooking.mutate({ id });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="relative overflow-hidden bg-[#1b1b1b] px-6 py-8 text-white sm:px-10 sm:py-11">
        <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10 sm:right-12" />
        <div className="absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10 sm:right-24" />
        <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ff5b35]">Your next chapter starts here</p>
            <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.06em] sm:text-7xl">My stays<span className="text-[#ff5b35]">.</span></h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">Every detail of your upcoming and past hotel stays, in one place.</p>
          </div>
          <Link to="/rooms" className="inline-flex w-fit items-center gap-3 bg-[#ff5b35] px-5 py-3 text-sm font-bold text-[#1b1b1b] transition hover:bg-[#ff8a6e]">
            <Plus className="h-4 w-4" />
            Find your next stay
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="border-b border-[#ded9ce]">
        <div className="-mb-px flex gap-1 overflow-x-auto pb-px" aria-label="Filter bookings by status">
          {['', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`shrink-0 border-b-2 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                statusFilter === status
                  ? 'border-[#ff5b35] text-[#1b1b1b]'
                  : 'border-transparent text-[#89877f] hover:border-[#c8b99a] hover:text-[#454b43]'
              }`}
            >
              {status || 'All stays'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <div className="grid gap-8 border border-[#ded9ce] bg-[#f3f2ee] p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e65332]">A clear calendar</p>
            <h2 className="text-3xl font-black tracking-tight text-[#1b1b1b] sm:text-5xl">No stays on the books.<br />Yet.</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#77766e]">Your next memorable getaway is only a few steps away. Explore our rooms and find a place to unwind.</p>
            <Link to="/rooms" className="mt-6 inline-flex items-center gap-2 bg-[#1b1b1b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">
              <Plus className="h-4 w-4" />
              Browse rooms
            </Link>
          </div>
          <CalendarCheck className="hidden h-24 w-24 text-[#ffad98] sm:block" strokeWidth={1} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#89877f]">Reservations <span className="ml-2 text-[#e65332]">{String(bookings.length).padStart(2, '0')}</span></p>
          </div>
          <div className="space-y-4">
            {bookings.map((booking: any, index: number) => {
              const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
              return (
                <article key={booking.id} className="group grid overflow-hidden border border-[#ded9ce] bg-[#fffdfa] transition hover:border-[#b8c5b7] sm:grid-cols-[minmax(0,1fr)_230px]">
                  <div className="relative grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-7">
                    <span className="absolute bottom-0 left-0 top-0 w-1 bg-[#ff5b35] transition group-hover:w-1.5" />
                    <div className="min-w-0 pl-1">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-semibold tracking-wide text-[#77766e]">{booking.bookingNumber}</span>
                        <span className={getBookingStatusColor(booking.status)}>{booking.status}</span>
                      </div>
                      <h2 className="text-xl font-bold leading-tight tracking-tight text-[#1b1b1b] sm:text-2xl">
                        {booking.room.roomType.name}
                      </h2>
                      <p className="mt-1 text-sm text-[#77766e]">Room {booking.room.roomNumber}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <span><span className="text-[#89877f]">IN</span> <strong className="ml-1 font-semibold text-[#454b43]">{formatDate(booking.checkInDate)}</strong></span>
                        <span className="text-[#b0aa9d]">→</span>
                        <span><span className="text-[#89877f]">OUT</span> <strong className="ml-1 font-semibold text-[#454b43]">{formatDate(booking.checkOutDate)}</strong></span>
                        <span className="text-xs font-bold uppercase tracking-wide text-[#e65332]">{nights} night{nights > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-dashed border-[#ded9ce] pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#89877f]">Stay total</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-[#1b1b1b]">{formatCurrency(Number(booking.totalAmount))}</p>
                      {booking.payment && (
                        <p className={`mt-1 text-xs font-medium ${booking.payment.status === 'COMPLETED' ? 'text-[#db4930]' : 'text-[#db4930]'}`}>
                          {booking.payment.status === 'COMPLETED' ? 'Paid in full' : 'Payment pending'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[#f3f1e9] px-5 py-4 sm:flex-col sm:items-stretch sm:justify-center sm:px-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#89877f]">Reservation {String(index + 1).padStart(2, '0')}</p>
                    <div className="flex items-center gap-4 sm:flex-col sm:items-stretch sm:gap-2">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="inline-flex items-center justify-center gap-2 bg-[#1b1b1b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                      >
                        View details <ChevronRight className="h-4 w-4" />
                      </Link>
                      {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking.id, booking.bookingNumber)}
                          className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#db4930] transition hover:text-[#873f29]"
                        >
                          Cancel stay
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-[#ded9ce] pt-5">
              <p className="text-sm text-[#77766e]">Page <strong className="text-[#1b1b1b]">{page}</strong> of {meta.totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="border border-[#ded9ce] px-4 py-2 text-sm font-semibold text-[#1b1b1b] transition hover:bg-[#f3f1e9] disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages} className="border border-[#ded9ce] px-4 py-2 text-sm font-semibold text-[#1b1b1b] transition hover:bg-[#f3f1e9] disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
