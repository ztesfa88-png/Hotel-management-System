import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BedDouble, Users, ChevronLeft, Check, Calendar, CreditCard, MapPin, ShieldCheck, Sparkles, Coffee } from 'lucide-react';
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
  const maxGuests = room?.roomType.maxGuests ?? 1;

  const handleBook = async () => {
    if (!user) {
      toast.error('Please sign in to book a room');
      navigate('/login', {
        state: {
          from: {
            pathname: `/rooms/${id}`,
            search: `?checkIn=${checkIn}&checkOut=${checkOut}`,
          },
        },
      });
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
      <div className="min-h-[60vh] bg-[#faf8f1] px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0eadb] text-[#18392e]">
          <BedDouble className="h-8 w-8" />
        </div>
        <h2 className="mb-4 text-2xl font-semibold text-[#18392e]">We couldn’t find that room</h2>
        <Link to="/rooms" className="inline-flex rounded-lg bg-[#18392e] px-5 py-3 font-semibold text-white hover:bg-[#245340]">Browse available rooms</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f1]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">
      <Link to="/rooms" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#5f6659] transition-colors hover:text-[#a45132]">
        <ChevronLeft className="h-4 w-4" /> Back to rooms
      </Link>

      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div>
          <div className="relative mb-6 h-72 overflow-hidden rounded-3xl bg-[#18392e] shadow-lg sm:h-[26rem]">
            {room.images?.[0] ? (
              <img src={room.images[0]} alt={`${room.roomType.name} at Woliso Hotel`} className="h-full w-full object-cover" />
            ) : (
              <>
                <div aria-hidden="true" className="absolute -right-8 -top-24 h-[34rem] w-[34rem] rounded-full border border-[#e9bd68]/40" />
                <div aria-hidden="true" className="absolute -right-1 -top-16 h-[27rem] w-[27rem] rounded-full border border-[#e9bd68]/25" />
                <div aria-hidden="true" className="absolute bottom-0 h-40 w-full bg-gradient-to-t from-black/50 to-transparent" />
                <div className="relative flex h-full flex-col items-center justify-center text-[#f2dca7]">
                  <BedDouble className="mb-5 h-24 w-24 stroke-[1.1]" />
                  <span className="font-serif text-4xl italic">{room.roomType.name}</span>
                  <span className="mt-2 text-xs uppercase tracking-[0.3em] text-white/70">A restful Woliso stay</span>
                </div>
              </>
            )}
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#18392e]/85 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              <MapPin className="h-4 w-4 text-[#e9bd68]" /> {room.branch?.name}
            </div>
            <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-[#18392e] shadow">
              <Sparkles className="h-4 w-4 text-[#a45132]" /> Your room in Woliso
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-[#e8e4d9] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#a45132]">Woliso Hotel · {room.branch?.city}</p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#18392e] sm:text-4xl">{room.roomType.name}</h1>
                <p className="mt-2 text-sm text-gray-500">Room {room.roomNumber} <span className="px-1 text-[#c4a458]">·</span> Floor {room.floor}</p>
              </div>
              <div className="rounded-xl bg-[#f6f3eb] px-4 py-3 sm:text-right">
                <p className="text-2xl font-bold text-[#a45132]">{formatCurrency(Number(room.roomType.basePrice))}</p>
                <p className="text-xs text-gray-500">per night · ETB</p>
              </div>
            </div>

            <div className="my-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-[#eeeae0] py-4 text-sm text-[#5f6659]">
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#a45132]" /> Up to {room.roomType.maxGuests} guests</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#a45132]" /> {room.branch?.city}, Ethiopia</span>
            </div>

            {room.roomType.description && (
              <p className="mb-4 leading-7 text-[#5f6659]">{room.roomType.description}</p>
            )}

            {room.description && (
              <p className="text-sm leading-6 text-gray-500">{room.description}</p>
            )}
          </div>

          {room.roomType.amenities && room.roomType.amenities.length > 0 && (
            <div className="rounded-2xl border border-[#e8e4d9] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0eadb] text-[#a45132]"><Coffee className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-semibold text-[#18392e]">Room comforts</h2>
                  <p className="text-xs text-gray-500">Thoughtful essentials for your stay</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {room.roomType.amenities.map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-3 rounded-xl bg-[#faf8f1] px-4 py-3 text-sm text-[#4e5a4d]">
                    <Check className="h-4 w-4 shrink-0 text-[#a45132]" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-[#e8e4d9] bg-white shadow-lg">
            <div className="bg-[#18392e] px-6 py-5 text-white">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e9bd68]">
                <ShieldCheck className="h-4 w-4" /> Secure reservation
              </div>
              <h2 className="text-xl font-semibold">Plan your stay</h2>
              <p className="mt-1 text-sm text-white/65">Your Woliso welcome is waiting.</p>
            </div>
            <div className="p-6">

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4 text-[#a45132]" />
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4 text-[#a45132]" />
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
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Adults</label>
                  <select
                    value={adults}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setAdults(value);
                      setChildren((current) => Math.min(current, maxGuests - value));
                    }}
                    className="input-field"
                  >
                    {Array.from({ length: maxGuests }, (_, index) => index + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Children</label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="input-field"
                  >
                    {Array.from(
                      { length: Math.min(3, maxGuests - adults) + 1 },
                      (_, index) => index,
                    ).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
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

            {nights > 0 && (
              <div className="mt-5 rounded-xl bg-[#f6f3eb] p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-2 text-gray-600">
                    <span>{formatCurrency(Number(room.roomType.basePrice))} × {nights} nights</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between gap-2 border-t border-[#ddd5c3] pt-3 text-base font-semibold text-[#18392e]">
                    <span>Total</span>
                    <span className="text-[#a45132]">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={createBooking.isPending || nights <= 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#a45132] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#873e27] focus:outline-none focus:ring-2 focus:ring-[#a45132] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {createBooking.isPending ? 'Creating Booking...' : 'Book Now'}
            </button>

            {!user && (
              <p className="mt-3 text-center text-xs text-gray-500">
                <Link to="/login" className="font-semibold text-[#a45132] hover:underline">Sign in</Link> to complete your booking
              </p>
            )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
