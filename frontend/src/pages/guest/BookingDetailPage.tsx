import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, BedDouble, Calendar, Users, FileText, CreditCard } from 'lucide-react';
import { useBooking } from '../../hooks/useBookings';
import { formatCurrency, formatDate, formatDateTime, getBookingStatusColor, getPaymentStatusColor, calculateNights } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const paymentReturned = searchParams.get('payment') === 'success';
  const { data: booking, isLoading, isError } = useBooking(id!, paymentReturned);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl border border-[#ded9ce] bg-[#f3f2ee] px-6 py-16 text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e65332]">Reservation lookup</p>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-[#1b1b1b]">
          {isError ? 'Unable to load this booking' : 'Booking not found'}
        </h2>
        <Link to="/bookings" className="inline-flex bg-[#1b1b1b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">My Bookings</Link>
      </div>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <Link to="/bookings" className="inline-flex items-center gap-2 text-sm font-semibold text-[#68746a] transition hover:text-[#1b1b1b]">
        <ChevronLeft className="h-4 w-4" />
        All reservations
      </Link>

      {paymentReturned && (
        <div
          role="status"
          className={`border-l-4 px-5 py-4 text-sm ${
            booking.payment?.status === 'COMPLETED'
              ? 'border-[#ff5b35] bg-[#fff0eb] text-[#87341f]'
              : 'border-[#ff5b35] bg-[#fff1ea] text-[#87341f]'
          }`}
        >
          {booking.payment?.status === 'COMPLETED'
            ? 'Payment received. Your booking is confirmed.'
            : 'Payment submitted. Please contact hotel staff if your payment status does not update.'}
        </div>
      )}

      <section className="overflow-hidden border border-[#ded9ce] bg-[#fffdfa]">
        <div className="relative overflow-hidden bg-[#1b1b1b] px-6 py-7 text-white sm:px-10 sm:py-9">
          <div className="absolute -right-10 -top-20 h-60 w-60 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff5b35]">Reservation detail</p>
              <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">{booking.room.roomType.name}</h1>
              <p className="mt-2 text-sm text-white/65">Room {booking.room.roomNumber} <span className="px-2 text-white/30">/</span> Booking <span className="font-mono text-white/85">{booking.bookingNumber}</span></p>
            </div>
            <span className={getBookingStatusColor(booking.status)}>{booking.status}</span>
          </div>
        </div>

        <div className="grid border-b border-[#ded9ce] sm:grid-cols-[1.25fr_1fr_1fr]">
          <div className="bg-[#f3f1e9] px-6 py-6 sm:px-8 sm:py-8">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e65332]">Your stay</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e65332]">Check in</p>
                <p className="mt-1 text-lg font-bold leading-tight text-[#1b1b1b]">{formatDate(booking.checkInDate)}</p>
              </div>
              <span className="mt-4 text-xl text-[#b3aa99]">→</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e65332]">Check out</p>
                <p className="mt-1 text-lg font-bold leading-tight text-[#1b1b1b]">{formatDate(booking.checkOutDate)}</p>
              </div>
            </div>
            <p className="mt-5 border-t border-[#ded9ce] pt-4 text-sm font-bold text-[#1b1b1b]">{nights} night{nights > 1 ? 's' : ''}</p>
          </div>
          <div className="border-t border-[#ded9ce] px-6 py-6 sm:border-l sm:border-t-0 sm:px-8 sm:py-8">
            <div className="mb-5 flex items-center gap-2 text-[#e65332]">
              <Users className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Party</p>
            </div>
            <p className="text-lg font-bold text-[#1b1b1b]">
              {booking.adults} adult{booking.adults > 1 ? 's' : ''}
              {booking.children > 0 && `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}`}
            </p>
            <p className="mt-1 text-sm text-[#77766e]">Guest count</p>
          </div>
          <div className="border-t border-[#ded9ce] px-6 py-6 sm:border-l sm:border-t-0 sm:px-8 sm:py-8">
            <div className="mb-5 flex items-center gap-2 text-[#e65332]">
              <CreditCard className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Stay total</p>
            </div>
            <p className="text-3xl font-black tracking-tight text-[#1b1b1b]">{formatCurrency(Number(booking.totalAmount))}</p>
            <p className="mt-1 text-sm text-[#77766e]">All nights included</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-[1fr_1fr]">
          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <div className="mb-4 flex items-center gap-3">
              <BedDouble className="h-4 w-4 text-[#e65332]" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#1b1b1b]">Your room</h2>
            </div>
            <p className="text-lg font-bold text-[#1b1b1b]">{booking.room.roomType.name}</p>
            <p className="mt-1 text-sm text-[#77766e]">Room {booking.room.roomNumber}</p>
          </div>
          {booking.specialRequests && (
            <div className="border-t border-[#ded9ce] px-6 py-6 sm:border-l sm:border-t-0 sm:px-8 sm:py-7">
              <div className="mb-4 flex items-center gap-3">
                <FileText className="h-4 w-4 text-[#e65332]" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#1b1b1b]">Special requests</h2>
              </div>
              <p className="text-sm leading-relaxed text-[#454b43]">{booking.specialRequests}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-[#ded9ce] px-6 py-4 text-xs text-[#89877f] sm:px-8">
          <Calendar className="h-3.5 w-3.5" />
          Reserved on {formatDateTime(booking.createdAt)}
        </div>
      </section>

      <section className="grid gap-0 border border-[#ded9ce] bg-[#fffdfa] sm:grid-cols-[260px_1fr]">
        <div className="bg-[#f3f1e9] px-6 py-6 sm:px-7">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e65332]">The account</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#ffebe5] text-[#e65332]">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#1b1b1b]">Payment</h2>
          </div>
        </div>
        <div className="px-6 py-5 sm:px-8">
          {booking.payment ? (
            <div className="divide-y divide-[#e3e1da]">
              <div className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-[#77766e]">Invoice #</span>
                <span className="text-right font-mono font-medium text-[#454b43]">{booking.payment.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-[#77766e]">Amount</span>
                <span className="font-bold text-[#1b1b1b]">{formatCurrency(Number(booking.payment.amount))}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-[#77766e]">Status</span>
                <span className={getPaymentStatusColor(booking.payment.status)}>{booking.payment.status}</span>
              </div>
              {booking.payment.paidAt && (
                <div className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="text-[#77766e]">Paid on</span>
                  <span className="text-right text-[#454b43]">{formatDateTime(booking.payment.paidAt)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="py-2 text-sm text-[#77766e]">No payment record yet.</p>
          )}

          {booking.payment?.status === 'PENDING' && booking.status !== 'CANCELLED' && (
            <p className="mt-4 border-l-4 border-[#ff5b35] bg-[#fff1ea] p-4 text-sm leading-relaxed text-[#87341f]">
              Please settle this balance with hotel staff. Online card payments are not configured.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
