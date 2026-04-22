import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, BedDouble, Users, DollarSign, Star, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useSearchRooms, useRoomTypes } from '../../hooks/useRooms';
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
  const [roomTypeId, setRoomTypeId] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searched, setSearched] = useState(false);

  const { data: roomTypes } = useRoomTypes();

  const searchQuery = {
    checkIn,
    checkOut,
    guests: guests || undefined,
    roomTypeId: roomTypeId || undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  const { data: rooms, isLoading, refetch } = useSearchRooms(searchQuery);

  useEffect(() => {
    if (searchParams.get('checkIn')) {
      setSearched(true);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setSearchParams({ checkIn, checkOut, guests: String(guests) });
    refetch();
  };

  const nights = calculateNights(checkIn, checkOut);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Available Rooms</h1>
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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
            <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : rooms && rooms.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{rooms.length}</span> rooms available
                  {nights > 0 && (
                    <span> for <span className="font-semibold">{nights} night{nights > 1 ? 's' : ''}</span></span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center py-16">
              <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms available</h3>
              <p className="text-gray-500 mb-6">
                No rooms match your search criteria. Try different dates or filters.
              </p>
              <button
                onClick={() => {
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
      )}
    </div>
  );
}

function RoomCard({ room, checkIn, checkOut, nights }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Room image placeholder */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <BedDouble className="w-16 h-16 text-primary-400" />
        )}
        <div className="absolute top-3 right-3">
          <span className="badge-success text-xs px-2 py-1">Available</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{room.roomType.name}</h3>
            <p className="text-sm text-gray-500">Room {room.roomNumber} • Floor {room.floor}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary-600">{formatCurrency(room.roomType.basePrice)}</p>
            <p className="text-xs text-gray-400">per night</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Up to {room.roomType.maxGuests} guests
          </span>
        </div>

        {room.roomType.amenities && room.roomType.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {room.roomType.amenities.slice(0, 3).map((amenity: string) => (
              <span key={amenity} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {amenity}
              </span>
            ))}
            {room.roomType.amenities.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                +{room.roomType.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {nights > 0 && (
          <div className="bg-primary-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{formatCurrency(room.roomType.basePrice)} × {nights} nights</span>
              <span className="font-semibold text-primary-700">{formatCurrency(room.totalPrice)}</span>
            </div>
          </div>
        )}

        <Link
          to={`/rooms/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}`}
          className="btn-primary w-full text-center flex items-center justify-center gap-2"
        >
          Book Now
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
