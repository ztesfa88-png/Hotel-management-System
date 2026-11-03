import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BedDouble, Users, MapPin, Star, Wifi, Coffee, Wind, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useBranches, useSearchRooms, useRoomTypes } from '../../hooks/useRooms';
import { formatCurrency, calculateNights } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SearchRoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tomorrow = addDays(new Date(), 1);
  const dayAfter  = addDays(new Date(), 3);

  const [checkIn,    setCheckIn]    = useState(searchParams.get('checkIn')  || format(tomorrow, 'yyyy-MM-dd'));
  const [checkOut,   setCheckOut]   = useState(searchParams.get('checkOut') || format(dayAfter,  'yyyy-MM-dd'));
  const [guests,     setGuests]     = useState(Number(searchParams.get('guests')) || 1);
  const [branchId,   setBranchId]   = useState(searchParams.get('branchId') || '');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [searched,   setSearched]   = useState(false);

  const { data: branches = [] } = useBranches();
  const { data: roomTypes }     = useRoomTypes();
  const { data: rooms, isLoading, isError } = useSearchRooms(
    { checkIn, checkOut, branchId: branchId || undefined, guests: guests || undefined, roomTypeId: roomTypeId || undefined },
    searched,
  );

  useEffect(() => { if (searchParams.get('checkIn')) setSearched(true); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setSearchParams({ checkIn, checkOut, guests: String(guests), ...(branchId ? { branchId } : {}) });
  };

  const nights = calculateNights(checkIn, checkOut);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden bg-stone-900 pb-0">
        <img
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=80"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 to-stone-900/90" />
        <div className="relative mx-auto max-w-7xl px-5 pt-14 sm:px-8 lg:px-10">
          <p className="font-ui mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9a96e]">
            <span className="h-px w-6 bg-[#c9a96e]" /> Find Your Room
          </p>
          <h1 className="font-display mb-10 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Browse available<br />
            <em className="not-italic text-[#c9a96e]">rooms.</em>
          </h1>
        </div>

        {/* Search form */}
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-t-2xl bg-white shadow-luxury-xl">
            <div className="h-1 bg-gradient-to-r from-[#c9a96e] via-[#e8501e] to-[#c9a96e]" />
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 divide-y divide-stone-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-6 lg:divide-y-0">
                {[
                  {
                    label: 'Branch', span: 'lg:col-span-1',
                    el: <select value={branchId} onChange={(e) => setBranchId(e.target.value)}
                          className="w-full appearance-none bg-transparent font-ui text-[14px] font-semibold text-stone-900 focus:outline-none">
                          <option value="">All branches</option>
                          {branches.map((b: { id: string; name: string }) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>,
                  },
                  {
                    label: 'Check In', span: 'lg:col-span-1',
                    el: <input type="date" value={checkIn} min={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full bg-transparent font-ui text-[14px] font-semibold text-stone-900 focus:outline-none" />,
                  },
                  {
                    label: 'Check Out', span: 'lg:col-span-1',
                    el: <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-transparent font-ui text-[14px] font-semibold text-stone-900 focus:outline-none" />,
                  },
                  {
                    label: 'Guests', span: 'lg:col-span-1',
                    el: <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                          className="w-full appearance-none bg-transparent font-ui text-[14px] font-semibold text-stone-900 focus:outline-none">
                          {[1,2,3,4].map((n) => <option key={n} value={n}>{n} {n===1?'Guest':'Guests'}</option>)}
                        </select>,
                  },
                  {
                    label: 'Type', span: 'lg:col-span-1',
                    el: <select value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}
                          className="w-full appearance-none bg-transparent font-ui text-[14px] font-semibold text-stone-900 focus:outline-none">
                          <option value="">All types</option>
                          {roomTypes?.map((rt: any) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                        </select>,
                  },
                ].map((f) => (
                  <div key={f.label} className={`px-5 py-4 ${f.span}`}>
                    <label className="font-ui mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{f.label}</label>
                    {f.el}
                  </div>
                ))}
                <div className="flex items-stretch border-t border-stone-100 sm:border-l sm:border-t-0 lg:col-span-1 lg:border-l lg:border-t-0">
                  <button type="submit"
                    className="flex min-h-full w-full items-center justify-center gap-2 bg-[#e8501e] px-6 font-ui text-sm font-bold text-white transition-colors hover:bg-[#c93e10] focus:outline-none focus:ring-2 focus:ring-[#e8501e] focus:ring-inset">
                    <Search className="h-4 w-4" /> Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        {!searched ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-8 py-16 text-center shadow-luxury">
            <Search className="mx-auto mb-4 h-10 w-10 text-stone-200" />
            <p className="font-ui text-[15px] font-medium text-stone-500">Select your dates above to find available rooms.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <LoadingSpinner size="lg" />
            <p className="font-ui text-sm text-stone-400">Searching rooms…</p>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="font-ui font-semibold text-red-700">Could not load rooms. Please try again.</p>
          </div>
        ) : rooms && rooms.length > 0 ? (
          <>
            <div className="mb-8">
              <p className="font-ui text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8501e]">Available now</p>
              <h2 className="font-display mt-1 text-3xl font-semibold text-stone-900">
                {rooms.length} room{rooms.length !== 1 ? 's' : ''} found
                {nights > 0 && <span className="font-sans text-xl font-normal text-stone-400"> · {nights} night{nights > 1 ? 's' : ''}</span>}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room: any) => (
                <RoomCard key={room.id} room={room} checkIn={checkIn} checkOut={checkOut} nights={nights} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-8 py-16 text-center shadow-luxury">
            <BedDouble className="mx-auto mb-4 h-10 w-10 text-stone-200" />
            <h3 className="font-ui mb-2 font-bold text-stone-900">No rooms found</h3>
            <p className="font-sans mb-6 text-sm text-stone-500">Try different dates or adjust your filters.</p>
            <button onClick={() => { setBranchId(''); setRoomTypeId(''); }} className="btn-secondary font-ui text-sm">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RoomCard({ room, checkIn, checkOut, nights }: any) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-luxury transition-all duration-300 hover:-translate-y-2 hover:shadow-luxury-lg">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-stone-100">
        {room.images?.[0] ? (
          <img src={room.images[0]} alt={room.roomType.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-stone-300">
            <BedDouble className="mb-2 h-12 w-12 stroke-[1]" />
            <span className="font-display text-xl">{room.roomType.name}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badge */}
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 font-ui text-[11px] font-bold text-stone-800 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Available
          </span>
        </div>

        {/* Gold rating */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1.5 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-[#c9a96e] text-[#c9a96e]" />
          <span className="font-ui text-[11px] font-semibold text-white">5.0</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-stone-900">{room.roomType.name}</h3>
            <p className="font-ui mt-0.5 text-xs text-stone-400">Room {room.roomNumber} · Floor {room.floor}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-[#e8501e]/15 bg-[#fff5f0] px-3 py-2 text-right">
            <p className="font-ui text-base font-black text-[#e8501e]">{formatCurrency(room.roomType.basePrice)}</p>
            <p className="font-ui mt-0.5 text-[10px] text-stone-400">/ night</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 border-y border-stone-100 py-3 text-xs text-stone-500">
          <span className="font-ui flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-[#e8501e]" /> Up to {room.roomType.maxGuests}</span>
          <span className="font-ui flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#e8501e]" /> {room.branch?.name}</span>
        </div>

        {room.roomType.amenities?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {room.roomType.amenities.slice(0, 3).map((a: string, i: number) => (
              <span key={a} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 font-ui text-[11px] font-medium text-stone-600">
                {i===0 ? <Wifi className="h-3 w-3 text-[#e8501e]" /> : i===1 ? <Coffee className="h-3 w-3 text-[#e8501e]" /> : <Wind className="h-3 w-3 text-[#e8501e]" />}
                {a}
              </span>
            ))}
            {room.roomType.amenities.length > 3 && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-ui text-[11px] text-stone-400">+{room.roomType.amenities.length - 3}</span>
            )}
          </div>
        )}

        {nights > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-stone-50 px-4 py-2.5">
            <span className="font-ui text-sm text-stone-500">{formatCurrency(room.roomType.basePrice)} × {nights} nights</span>
            <span className="font-ui text-sm font-bold text-stone-900">{formatCurrency(room.totalPrice)}</span>
          </div>
        )}

        <Link
          to={`/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&branchId=${room.branchId}`}
          className="group/btn btn-primary font-ui flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm"
        >
          View room &amp; book
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
