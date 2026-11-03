import { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  BedDouble, Users, ChevronLeft, Check, Calendar, CreditCard,
  MapPin, ShieldCheck, Sparkles, Coffee, Star, Wifi, Wind,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useRoom } from '../../hooks/useRooms';
import { useCreateBooking } from '../../hooks/useBookings';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency, calculateNights } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const amenityIconMap: Record<string, React.ReactNode> = {
  wifi:   <Wifi    className="h-4 w-4 text-[#f05a3a]" />,
  coffee: <Coffee  className="h-4 w-4 text-[#f05a3a]" />,
  ac:     <Wind    className="h-4 w-4 text-[#f05a3a]" />,
};

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet'))
    return amenityIconMap.wifi;
  if (lower.includes('coffee') || lower.includes('buna'))
    return amenityIconMap.coffee;
  if (lower.includes('air') || lower.includes('ac') || lower.includes('condition'))
    return amenityIconMap.ac;
  return <Sparkles className="h-4 w-4 text-[#f05a3a]" />;
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const tomorrow = addDays(new Date(), 1);
  const dayAfter  = addDays(new Date(), 3);

  const [checkIn,  setCheckIn]  = useState(searchParams.get('checkIn')  || format(tomorrow, 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || format(dayAfter,  'yyyy-MM-dd'));
  const [adults,   setAdults]   = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');

  const { data: room, isLoading } = useRoom(id!);
  const createBooking = useCreateBooking();

  const nights    = calculateNights(checkIn, checkOut);
  const totalPrice = room ? Number(room.roomType.basePrice) * nights : 0;
  const maxGuests  = room?.roomType.maxGuests ?? 1;

  const handleBook = async () => {
    if (!user) {
      toast.error('Please sign in to book a room');
      navigate('/login', {
        state: { from: { pathname: `/rooms/${id}`, search: `?checkIn=${checkIn}&checkOut=${checkOut}` } },
      });
      return;
    }

    createBooking.mutate(
      { roomId: id!, checkInDate: checkIn, checkOutDate: checkOut, adults, children, specialRequests: specialRequests || undefined },
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
      <div className="flex min-h-96 flex-col items-center justify-center gap-3 bg-[#f6f4ef]">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">Loading room details…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-[60vh] bg-[#f6f4ef] px-4 py-24 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7252] to-[#e8421e] text-white shadow-glow-sm">
          <BedDouble className="h-8 w-8" />
        </div>
        <h2 className="mb-3 text-3xl font-black tracking-[-0.04em] text-[#17191c]">We couldn't find that room</h2>
        <p className="mb-6 text-gray-500">It may have been removed or the link is incorrect.</p>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#1d2026] to-[#17191c] px-6 py-3 font-bold text-white shadow-elevated transition-all hover:from-[#ff7252] hover:to-[#e8421e]"
        >
          Browse available rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#17191c]">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-7 sm:px-6 sm:pb-18 lg:px-8 lg:pt-10">

        {/* Breadcrumb */}
        <Link
          to="/rooms"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-[#e8e0d4] bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-all duration-200 hover:border-[#f05a3a]/30 hover:text-[#f05a3a]"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to rooms
        </Link>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* Hero image */}
            <div className="relative overflow-hidden rounded-3xl bg-[#17191c] h-80 sm:h-[34rem]">
              {room.images?.[0] ? (
                <img
                  src={room.images[0]}
                  alt={`${room.roomType.name} at Woliso Hotel`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <div aria-hidden="true" className="absolute -right-8 -top-24 h-[34rem] w-[34rem] rounded-full border border-[#ff7252]/30" />
                  <div aria-hidden="true" className="absolute bottom-0 h-40 w-full bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="relative flex h-full flex-col items-center justify-center text-[#ff7252]">
                    <BedDouble className="mb-5 h-24 w-24 stroke-[1.1]" />
                    <span className="font-display text-4xl text-white">{room.roomType.name}</span>
                    <span className="mt-2 text-xs uppercase tracking-[0.3em] text-white/55">A restful Woliso stay</span>
                  </div>
                </>
              )}

              {/* Overlay badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17191c]/82 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-[#ff7252]" /> {room.branch?.name}
              </div>

              <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Star className="h-4 w-4 fill-[#ffd166] text-[#ffd166]" />
                Top rated
              </div>

              <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7252] to-[#e8421e] px-4 py-2 text-xs font-bold text-white shadow-glow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Your room in Woliso
              </div>
            </div>

            {/* Room info card */}
            <div className="overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-[#ff7252] to-[#e8421e]" />
              <div className="p-7 sm:p-9">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#f05a3a]">
                      Woliso Hotel · {room.branch?.city}
                    </p>
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.05em] text-[#17191c] sm:text-5xl">
                      {room.roomType.name}
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                      Room {room.roomNumber}
                      <span className="mx-1.5 text-[#f05a3a]">·</span>
                      Floor {room.floor}
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#ffe4d4] bg-[#fff0e9] px-5 py-4 text-right">
                    <p className="text-3xl font-black tracking-tight text-[#e8421e]">
                      {formatCurrency(Number(room.roomType.basePrice))}
                    </p>
                    <p className="text-xs font-medium text-gray-400">per night · ETB</p>
                  </div>
                </div>

                <div className="my-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-[#f0ebe5] py-5 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff0e9]">
                      <Users className="h-3.5 w-3.5 text-[#f05a3a]" />
                    </div>
                    Up to {room.roomType.maxGuests} guests
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff0e9]">
                      <MapPin className="h-3.5 w-3.5 text-[#f05a3a]" />
                    </div>
                    {room.branch?.city}, Ethiopia
                  </span>
                </div>

                {room.roomType.description && (
                  <p className="mb-3 text-base leading-7 text-gray-600">{room.roomType.description}</p>
                )}
                {room.description && (
                  <p className="text-sm leading-6 text-gray-400">{room.description}</p>
                )}
              </div>
            </div>

            {/* Amenities */}
            {room.roomType.amenities?.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white shadow-sm">
                <div className="p-7 sm:p-9">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7252] to-[#e8421e] text-white shadow-glow-sm">
                      <Coffee className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#17191c]">Room comforts</h2>
                      <p className="text-xs text-gray-400">Thoughtful essentials for your stay</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
                    {room.roomType.amenities.map((amenity: string) => (
                      <div
                        key={amenity}
                        className="group flex items-center gap-3 border-t border-[#f0ebe5] py-4 text-sm text-gray-600 first:border-t-0 sm:first-of-type:border-t"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#ffe4d4] bg-[#fff8f5] transition-all duration-200 group-hover:border-[#f05a3a]/30 group-hover:bg-[#fff0e9]">
                          {getAmenityIcon(amenity)}
                        </div>
                        <span className="font-medium">{amenity}</span>
                        <Check className="ml-auto h-4 w-4 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (booking panel) ────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl shadow-[0_24px_64px_rgba(20,43,36,0.16)]">
              {/* Header */}
              <div className="bg-[#13151a] px-7 py-7">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ff8567]">
                  <ShieldCheck className="h-4 w-4" /> Secure reservation
                </div>
                <h2 className="text-2xl font-black tracking-[-0.03em] text-white">Plan your stay</h2>
                <p className="mt-1.5 text-sm text-white/55">Your Woliso welcome is waiting.</p>

                {room.roomType.basePrice && (
                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-3xl font-black text-[#ff8567]">
                      {formatCurrency(Number(room.roomType.basePrice))}
                    </span>
                    <span className="mb-1 text-sm text-white/45">/ night</span>
                  </div>
                )}
              </div>

              {/* Form body */}
              <div className="bg-white p-6 sm:p-7">
                <div className="space-y-4">

                  {/* Dates row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                        <Calendar className="h-3.5 w-3.5 text-[#f05a3a]" /> Check In
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="input-field border-[#e0d8d0] bg-white focus:border-[#f05a3a] focus:ring-[#f05a3a]/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
                        <Calendar className="h-3.5 w-3.5 text-[#f05a3a]" /> Check Out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="input-field border-[#e0d8d0] bg-white focus:border-[#f05a3a] focus:ring-[#f05a3a]/20"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">Adults</label>
                      <select
                        value={adults}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setAdults(v);
                          setChildren((c) => Math.min(c, maxGuests - v));
                        }}
                        className="input-field border-[#e0d8d0] bg-white focus:border-[#f05a3a] focus:ring-[#f05a3a]/20"
                      >
                        {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">Children</label>
                      <select
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="input-field border-[#e0d8d0] bg-white focus:border-[#f05a3a] focus:ring-[#f05a3a]/20"
                      >
                        {Array.from({ length: Math.min(3, maxGuests - adults) + 1 }, (_, i) => i).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Special requests */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-400">
                      Special Requests (optional)
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      placeholder="Any special requirements..."
                      className="input-field resize-none border-[#e0d8d0] bg-white focus:border-[#f05a3a] focus:ring-[#f05a3a]/20"
                    />
                  </div>
                </div>

                {/* Price summary */}
                {nights > 0 && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-[#f0ebe5]">
                    <div className="bg-[#fdf8f3] px-4 py-3">
                      <div className="flex justify-between gap-2 text-sm text-gray-500">
                        <span>{formatCurrency(Number(room.roomType.basePrice))} × {nights} nights</span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between gap-2 border-t border-[#f0ebe5] bg-white px-4 py-3 text-base font-black text-[#17191c]">
                      <span>Total</span>
                      <span className="text-gradient-coral">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Book button */}
                <button
                  onClick={handleBook}
                  disabled={createBooking.isPending || nights <= 0}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ff7252] to-[#e8421e] px-4 py-3 font-bold text-white shadow-btn-coral transition-all duration-300 hover:shadow-glow-sm hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#f05a3a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-btn-coral"
                >
                  <CreditCard className="h-4 w-4" />
                  {createBooking.isPending ? 'Creating booking…' : 'Book Now'}
                </button>

                {!user && (
                  <p className="mt-3 text-center text-xs text-gray-400">
                    <Link to="/login" className="font-bold text-[#f05a3a] hover:underline">Sign in</Link>
                    {' '}to complete your booking
                  </p>
                )}

                {/* Trust signals */}
                <div className="mt-5 flex items-center justify-center gap-4 border-t border-[#f0ebe5] pt-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Secure
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Clear ETB rates
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Star className="h-3.5 w-3.5 fill-[#ffd166] text-[#ffd166]" /> Top rated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
