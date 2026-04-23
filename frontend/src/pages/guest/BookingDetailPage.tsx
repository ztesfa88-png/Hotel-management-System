import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BedDouble, Calendar, Users, CreditCard, FileText } from 'lucide-react';
import { useBooking } from '../../hooks/useBookings';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDate, formatDateTime, getBookingStatusColor, getPaymentStatusColor, calculateNights } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading } = useBooking(id!);

  const createCheckout = useMutation({
    mutationFn: () => api.post(`/payments/checkout/${id}`).then((r) => r.data.data),
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    },
    onError: () => {
      toast.error('Failed to create payment session');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking not found</h2>
        <Link to="/bookings" className="btn-primary">My Bookings</Link>
      </div>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const canPay = booking.status !== 'CANCELLED' && (!booking.payment || booking.payment.status === 'PENDING' || booking.payment.status === 'FAILED');

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/bookings" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
          <ChevronLeft className="w-4 h-4" />
          Back to bookings
        </Link>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Booking Details</h1>
            <p className="font-mono text-sm text-gray-500">{booking.bookingNumber}</p>
          </div>
          <span className={getBookingStatusColor(booking.status)}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <BedDouble className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Room</p>
              <p className="font-semibold text-gray-900">{booking.room.roomType.name}</p>
              <p className="text-sm text-gray-500">Room {booking.room.roomNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Stay Duration</p>
              <p className="font-semibold text-gray-900">{nights} night{nights > 1 ? 's' : ''}</p>
              <p className="text-sm text-gray-500">
                {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Guests</p>
              <p className="font-semibold text-gray-900">
                {booking.adults} adult{booking.adults > 1 ? 's' : ''}
                {booking.children > 0 && `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
              <p className="font-bold text-xl text-primary-600">{formatCurrency(Number(booking.totalAmount))}</p>
            </div>
          </div>
        </div>

        {booking.specialRequests && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Special Requests</p>
            <p className="text-sm text-gray-700">{booking.specialRequests}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
          Booked on {formatDateTime(booking.createdAt)}
        </div>
      </div>

      {/* Payment section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Payment</h2>
        </div>

        {booking.payment ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invoice #</span>
              <span className="font-mono font-medium">{booking.payment.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold">{formatCurrency(Number(booking.payment.amount))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={getPaymentStatusColor(booking.payment.status)}>
                {booking.payment.status}
              </span>
            </div>
            {booking.payment.paidAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paid on</span>
                <span>{formatDateTime(booking.payment.paidAt)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No payment record yet.</p>
        )}

        {canPay && booking.status !== 'CANCELLED' && (
          <button
            onClick={() => createCheckout.mutate()}
            disabled={createCheckout.isPending}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {createCheckout.isPending ? 'Redirecting...' : 'Pay Now with Stripe'}
          </button>
        )}
      </div>
    </div>
  );
}
