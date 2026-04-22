import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Shield, Clock, Wifi, Coffee, Car, Dumbbell } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function HomePage() {
  const navigate = useNavigate();
  const tomorrow = addDays(new Date(), 1);
  const dayAfter = addDays(new Date(), 3);

  const [checkIn, setCheckIn] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(dayAfter, 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const features = [
    { icon: Wifi, label: 'Free WiFi', desc: 'High-speed internet throughout' },
    { icon: Coffee, label: 'Breakfast', desc: 'Complimentary breakfast daily' },
    { icon: Car, label: 'Free Parking', desc: 'Secure on-site parking' },
    { icon: Dumbbell, label: 'Fitness Center', desc: '24/7 gym access' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Absolutely stunning hotel! The rooms were immaculate and the staff was incredibly helpful.',
      date: 'March 2026',
    },
    {
      name: 'Michael Chen',
      rating: 5,
      text: 'Best hotel experience I\'ve had. The booking process was seamless and the room exceeded expectations.',
      date: 'February 2026',
    },
    {
      name: 'Emma Williams',
      rating: 4,
      text: 'Beautiful property with excellent amenities. Will definitely be returning for my next trip.',
      date: 'January 2026',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Perfect Stay
              <br />
              <span className="text-primary-300">Awaits You</span>
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Experience luxury, comfort, and exceptional service. Book your dream room today
              and create unforgettable memories.
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-2xl p-6 grid grid-cols-1 sm:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Check In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="input-field text-gray-900"
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
                  className="input-field text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="input-field text-gray-900"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We provide world-class amenities and services to make your stay truly exceptional.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="text-center p-6 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.label}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Happy Guests' },
              { value: '50+', label: 'Luxury Rooms' },
              { value: '15+', label: 'Years Experience' },
              { value: '4.9', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-primary-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Guest Reviews</h2>
            <p className="text-gray-500">What our guests say about their experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
            <span className="text-primary-600 font-semibold">Secure Booking</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-gray-500 mb-8">
            Browse our available rooms and find the perfect accommodation for your needs.
            Instant confirmation, flexible cancellation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/rooms" className="btn-primary px-8 py-3 text-base">
              Browse Rooms
            </a>
            <a href="/register" className="btn-secondary px-8 py-3 text-base">
              Create Account
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
