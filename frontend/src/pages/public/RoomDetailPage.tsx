import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BedDouble, Users, ChevronLeft, Check, Calendar, CreditCard } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useRoom } from '../../hooks/useRooms';
import { useCreateBooking } from '../../hooks/useBookings';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, calculateNights } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const tomorrow = addDays(new Date(), 1);
  const dayAfter = addDays(new Date(), 3);

  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') || format(tomorrow, 'yyyy-MM-dd'),
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') || format(dayAfter, 'yyyy-MM-dd'),
  );
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');

  const { data: room, isLoading } = useRoom(id!);
  const createBooking = useCreateBooking();

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = room ? Number(room.roomType.basePrice) * nights : 0;

  const handleBook = async () => {
    if (!user) {
      toast.error('Please sign in to book a room');
      navigate('/login');
      return;
    }

    createBooking.mutate(
      {
        roomId: id!,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        children,
        specialRequests: specialRequests || undefined,
      },
      {
        onSuccess: (response) => {
          const bookingId = response.data.data.id;
          navigate(`/bookings/${bookingId}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h2>
        <Link to="/rooms" className="btn-primary">Browse Rooms</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/rooms" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" />
        Back to rooms
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room details */}
        <div className="lg:col-span-2">
          {/* Image */}
          <div className="h-72 sm:h-96 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
            {room.images && room.images.length > 0 ? (
              <img src={room.images[0]} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" />
            ) : (
              <BedDouble className="w-24 h-24 text-primary-400" />
            )}
          </div>

          {/* Info */}
          <div className="card mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{room.roomType.name}</h1>
                <p className="text-gray-500">Room {room.roomNumber} • Floor {room.floor}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(Number(room.roomType.basePrice))}
                </p>
                <p className="text-sm text-gray-400">per night</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                Up to {room.roomType.maxGuests} guests
              </span>
            </div>

            {room.roomType.description && (
              <p className="text-gray-600 leading-relaxed mb-4">{room.roomType.description}</p>
            )}

            {room.description && (
              <p className="text-gray-500 text-sm">{room.description}</p>
            )}
          </div>

          {/* Amenities */}
          {room.roomType.amenities && room.roomType.amenities.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.roomType.amenities.map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Book This Room</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Check In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Check Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Adults</label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="input-field"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Children</label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="input-field"
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Special Requests (optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Any special requirements..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* Price summary */}
            {nights > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{formatCurrency(Number(room.roomType.basePrice))} × {nights} nights</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-primary-600">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={createBooking.isPending || nights <= 0}
              className="btn-primary w-full mt-5 py-3 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {createBooking.isPending ? 'Creating Booking...' : 'Book Now'}
            </button>

            {!user && (
              <p className="text-center text-xs text-gray-500 mt-3">
                <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> to complete your booking
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
