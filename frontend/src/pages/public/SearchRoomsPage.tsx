import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BedDouble, Users, ChevronRight, MapPin, Sparkles, Star, Wifi, Coffee, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useBranches, useSearchRooms, useRoomTypes } from '../../hooks/useRooms';
import { formatCurrency, calculateNights } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SearchRoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tomorrow = addDays(new Date(), 1);
  const dayAfter = addDays(new Date(), 3);

  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') || format(tomorrow, 'yyyy-MM-dd'),
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') || format(dayAfter, 'yyyy-MM-dd'),
  );
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [branchId, setBranchId] = useState(searchParams.get('branchId') || '');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searched, setSearched] = useState(false);

  const { data: branches = [] } = useBranches();
  const { data: roomTypes } = useRoomTypes();

  const searchQuery = {
    checkIn,
    checkOut,
    branchId: branchId || undefined,
    guests: guests || undefined,
    roomTypeId: roomTypeId || undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  const { data: rooms, isLoading, isError } = useSearchRooms(searchQuery, searched);

  useEffect(() => {
    if (searchParams.get('checkIn')) {
      setSearched(true);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      ...(branchId ? { branchId } : {}),
    });
  };

  const nights = calculateNights(checkIn, checkOut);

  return (
    <div className="min-h-screen bg-[#faf8f1]">
      <section className="relative overflow-hidden bg-[#18392e] text-white">
        <div aria-hidden="true" className="absolute -right-24 -top-40 h-96 w-96 rounded-full border border-[#e9bd68]/25" />
        <div aria-hidden="true" className="absolute -right-12 -top-28 h-72 w-72 rounded-full border border-[#e9bd68]/20" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 lg:px-8">
          <div className="mb-8">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#e9bd68]">
              <Sparkles className="h-4 w-4" /> Your Woliso stay
            </span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find a room to feel at home.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Choose your branch, dates, and room style. Your next Woliso welcome is just a few steps away.
            </p>
          </div>
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 rounded-2xl border border-white/50 bg-white p-5 shadow-xl sm:grid-cols-2 sm:p-6 lg:grid-cols-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="input-field"
            >
              <option value="">All branches</option>
              {branches.map((branch: { id: string; name: string }) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="input-field"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Room Type
            </label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              {roomTypes?.map((rt: any) => (
                <option key={rt.id} value={rt.id}>{rt.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#a45132] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#873e27] focus:outline-none focus:ring-2 focus:ring-[#a45132] focus:ring-offset-2">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {searched ? (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : isError ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6 text-center text-sm text-red-700">
              Rooms could not be loaded. Please check your connection and try again.
            </div>
          ) : rooms && rooms.length > 0 ? (
            <>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45132]">Your options</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#18392e]">{rooms.length} room{rooms.length === 1 ? '' : 's'} available</h2>
                </div>
                <p className="text-sm text-gray-500">
                  {nights > 0 && (
                    <span> for <span className="font-semibold">{nights} night{nights > 1 ? 's' : ''}</span></span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room: any) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    nights={nights}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-[#e8e4d9] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0eadb] text-[#18392e]">
                <BedDouble className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#18392e]">No rooms found for these dates</h3>
              <p className="mb-6 text-gray-500">
                No rooms match your search criteria. Try different dates or filters.
              </p>
              <button
                onClick={() => {
                  setBranchId('');
                  setRoomTypeId('');
                  setMaxPrice('');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e8e4d9] bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Choose your dates and branch above to discover available rooms.
        </div>
      )}
      </section>
    </div>
  );
}

function RoomCard({ room, checkIn, checkOut, nights }: any) {
  const roomImage = room.images?.[0];
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#e8e4d9] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c4a458] hover:shadow-xl">
      <div className="relative h-56 overflow-hidden bg-[#18392e]">
        {roomImage ? (
          <img
            src={roomImage}
            alt={`Room ${room.roomNumber}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <div aria-hidden="true" className="absolute -right-8 -top-16 h-60 w-60 rounded-full border border-[#e9bd68]/40" />
            <div aria-hidden="true" className="absolute -right-1 -top-9 h-44 w-44 rounded-full border border-[#e9bd68]/30" />
            <div aria-hidden="true" className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-black/35 to-transparent" />
            <div className="relative flex h-full flex-col items-center justify-center text-[#f2dca7]">
              <BedDouble className="mb-3 h-14 w-14 stroke-[1.2]" />
              <span className="font-serif text-2xl italic">{room.roomType.name}</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/70">Woliso Hotel</span>
            </div>
          </>
        )}
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#18392e]/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Available
          </span>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-[#e9bd68] text-[#e9bd68]" /> Woliso Hotel
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[#18392e]">{room.roomType.name}</h3>
            <p className="mt-1 text-sm text-gray-500">Room {room.roomNumber} <span className="px-1 text-[#c4a458]">·</span> Floor {room.floor}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-bold text-[#a45132]">{formatCurrency(room.roomType.basePrice)}</p>
            <p className="text-xs text-gray-400">per night</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-[#eeeae0] py-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-[#a45132]" /> Up to {room.roomType.maxGuests} guests</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#a45132]" /> {room.branch?.name}</span>
        </div>

        {room.roomType.amenities && room.roomType.amenities.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {room.roomType.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <span key={amenity} className="inline-flex items-center gap-1 rounded-full bg-[#f6f3eb] px-2.5 py-1 text-xs text-[#5f6659]">
                {index === 0 ? <Wifi className="h-3 w-3 text-[#a45132]" /> : index === 1 ? <Coffee className="h-3 w-3 text-[#a45132]" /> : <Sparkles className="h-3 w-3 text-[#a45132]" />}
                {amenity}
              </span>
            ))}
            {room.roomType.amenities.length > 3 && (
              <span className="rounded-full bg-[#f6f3eb] px-2.5 py-1 text-xs text-[#5f6659]">
                +{room.roomType.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {nights > 0 && (
          <div className="mb-4 rounded-xl bg-[#f6f3eb] p-3.5">
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-gray-600">{formatCurrency(room.roomType.basePrice)} × {nights} nights</span>
              <span className="font-semibold text-[#18392e]">{formatCurrency(room.totalPrice)}</span>
            </div>
          </div>
        )}

        <Link
          to={`/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&branchId=${room.branchId}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#18392e] px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-[#245340] focus:outline-none focus:ring-2 focus:ring-[#18392e] focus:ring-offset-2"
        >
          View room & book
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
