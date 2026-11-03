import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CalendarCheck, Coffee, Hotel,
  MapPin, Search, Shield, Star, Wifi, Bath, Wind, BedDouble,
  Users, ChevronRight,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useBranches } from '../../hooks/useRooms';

/* ── Scroll reveal ───────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ── Label component ─────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-ui mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#e8501e]">
      <span className="h-px w-8 bg-[#e8501e]" />
      {children}
    </p>
  );
}

export default function HomePage() {
  const navigate   = useNavigate();
  const { data: branches = [], isError, refetch } = useBranches();
  const tomorrow   = addDays(new Date(), 1);
  const dayAfter   = addDays(new Date(), 3);

  const [branchId,  setBranchId]  = useState('');
  const [checkIn,   setCheckIn]   = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [checkOut,  setCheckOut]  = useState(format(dayAfter,  'yyyy-MM-dd'));
  const [guests,    setGuests]    = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  useReveal();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/rooms?${new URLSearchParams({ checkIn, checkOut, guests: String(guests), branchId })}`);
  };

  const features = [
    { icon: MapPin,        n: '01', title: 'Two prime locations',   body: 'Both branches sit in the heart of Woliso, convenient to reach from anywhere in the city.' },
    { icon: Shield,        n: '02', title: 'Transparent ETB rates', body: 'Every room rate displayed in Ethiopian Birr — what you see is exactly what you pay.' },
    { icon: CalendarCheck, n: '03', title: 'Instant confirmation',  body: 'Your booking is confirmed the moment you submit — no waiting, no uncertainty.' },
    { icon: BedDouble,     n: '04', title: 'Rooms for every stay',  body: 'Solo, couple, or family — we have the right room size and price point for your trip.' },
  ];

  const amenities = [
    { icon: Wifi,   label: 'Free WiFi' },
    { icon: Coffee, label: 'Daily Buna' },
    { icon: Bath,   label: 'En-suite Bath' },
    { icon: Wind,   label: 'Climate Control' },
    { icon: Shield, label: 'Secure Booking' },
    { icon: Star,   label: 'Rated 5 Stars' },
  ];

  const culturalGuides = [
    {
      icon: Coffee, label: 'Ethiopian Coffee',
      title: 'Make time for buna',
      body: "Coffee here is far more than a drink — it's a ceremony of hospitality. If invited to join a buna ceremony, follow your host's lead, enjoy the three rounds, and savour the pause.",
      tip: 'A small moment can leave a lasting memory.',
    },
    {
      icon: MapPin, label: 'Local Language',
      title: 'A few words go a long way',
      body: 'Baga nagaan dhuftan means "welcome." Galatoomi is "thank you." Akkam? is a friendly "how are you?" Even one phrase opens a door and draws a warm smile.',
      tip: 'Pronunciation varies — always fine to ask your host.',
    },
    {
      icon: Users, label: 'Sharing a Meal',
      title: 'Eating together',
      body: 'Ethiopian meals are served on injera with shared dishes for the whole table. Wash hands before eating, take your cue from those around you, and enjoy the communal spirit.',
      tip: 'Ask locally what is fresh and in season today.',
    },
  ];

  const testimonials = [
    { name: 'Abebe T.', role: 'Business Traveler', rating: 5, text: "The best stay I've had in Woliso. Staff genuinely cared about making the visit special. Already planning my return." },
    { name: 'Sara M.',  role: 'Family Vacation',   rating: 5, text: 'Spotless rooms, generous breakfast, and the warmest welcome. Our kids still talk about it weeks later.' },
    { name: 'Dawit H.', role: 'Weekend Getaway',   rating: 5, text: 'Booking was instant, the room was exactly as shown, and the price was completely fair. No surprises at all.' },
  ];

  const active = culturalGuides[activeTab];

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] overflow-hidden bg-stone-900">

        {/* Background image with ken-burns */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=85"
            alt=""
            aria-hidden
            className="h-full w-full object-cover animate-[kenBurns_14s_ease-in-out_infinite_alternate]"
            style={{ transformOrigin: 'center center' }}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/60 to-stone-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent" />

        {/* Content */}
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-40 pt-20 sm:px-8 lg:px-10 lg:pb-52">
          <div className="max-w-2xl">

            {/* Location badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-4 py-2 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
              <span className="font-ui text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9a96e]">Woliso, Oromia · Ethiopia</span>
            </div>

            {/* Headline — serif display font */}
            <h1 className="font-display font-semibold leading-[0.92] text-white" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', letterSpacing: '-0.02em' }}>
              Stay where<br />
              <em className="not-italic text-[#c9a96e]">you belong.</em>
            </h1>

            <p className="mt-6 max-w-md font-sans text-base leading-7 text-white/65">
              Baga nagaan dhuftan — welcome. Thoughtful rooms, honest prices in Ethiopian Birr, and a genuine local experience in the heart of Woliso.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/rooms"
                className="btn-primary font-ui inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5">
                <BedDouble className="h-4 w-4" />
                View All Rooms
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/register"
                className="btn-ghost font-ui inline-flex items-center gap-2 rounded-xl border-white/30 px-6 py-3.5 text-white hover:border-white/60 hover:bg-white/10">
                Create account
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-8">
              {[
                { value: `${branches.length || 2}`, label: 'Locations' },
                { value: '5★', label: 'Guest Rating' },
                { value: 'ETB', label: 'Clear Pricing' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-semibold text-[#c9a96e]">{s.value}</p>
                  <p className="font-ui text-xs font-medium uppercase tracking-[0.18em] text-white/45 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Booking widget overlapping hero bottom ── */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="mx-auto max-w-5xl px-5 pb-0 sm:px-8 lg:px-10">
            <form onSubmit={handleSearch} className="overflow-hidden rounded-t-2xl bg-white shadow-luxury-xl">
              {/* Gold top line */}
              <div className="h-1 bg-gradient-to-r from-[#c9a96e] via-[#e8501e] to-[#c9a96e]" />

              <div className="grid grid-cols-1 divide-y divide-stone-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:divide-y-0">
                {[
                  {
                    label: 'Branch',
                    el: (
                      <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required disabled={!branches.length}
                        className="w-full appearance-none bg-transparent font-ui text-[15px] font-semibold text-stone-900 focus:outline-none disabled:text-stone-400">
                        <option value="">{branches.length ? 'Choose branch' : 'Loading…'}</option>
                        {branches.map((b: { id: string; name: string }) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    ),
                  },
                  {
                    label: 'Check In',
                    el: (
                      <input type="date" value={checkIn} min={format(new Date(), 'yyyy-MM-dd')} onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-transparent font-ui text-[15px] font-semibold text-stone-900 focus:outline-none" />
                    ),
                  },
                  {
                    label: 'Check Out',
                    el: (
                      <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-transparent font-ui text-[15px] font-semibold text-stone-900 focus:outline-none" />
                    ),
                  },
                  {
                    label: 'Guests',
                    el: (
                      <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full appearance-none bg-transparent font-ui text-[15px] font-semibold text-stone-900 focus:outline-none">
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                      </select>
                    ),
                  },
                ].map((f) => (
                  <div key={f.label} className="px-6 py-5">
                    <label className="font-ui mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{f.label}</label>
                    {f.el}
                  </div>
                ))}
                <div className="flex items-stretch">
                  <button type="submit"
                    className="flex min-w-[130px] w-full items-center justify-center gap-2 bg-[#e8501e] px-8 font-ui text-sm font-bold text-white transition-colors hover:bg-[#c93e10] focus:outline-none focus:ring-2 focus:ring-[#e8501e] focus:ring-inset">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </div>
              </div>

              {isError && (
                <div className="border-t border-stone-100 px-6 py-3 text-sm text-red-600">
                  Could not load branches. <button type="button" onClick={() => refetch()} className="font-bold underline">Retry</button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          AMENITY STRIP
      ═══════════════════════════════════════════════════ */}
      <section className="border-b border-stone-200 bg-stone-900">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center divide-x divide-white/10">
            {amenities.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 px-6 py-4">
                <Icon className="h-4 w-4 text-[#c9a96e]" />
                <span className="font-ui text-[12px] font-semibold tracking-wide text-white/55">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════ */}
      <section className="bg-[#faf9f7] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-16">
            <div className="reveal">
              <Label>Why choose us</Label>
              <h2 className="font-display text-5xl font-semibold leading-[0.92] tracking-tight text-stone-900 sm:text-6xl">
                Everything you need,<br />
                <em className="not-italic text-[#e8501e]">nothing you don't.</em>
              </h2>
            </div>
            <div className="flex items-end reveal reveal-delay-1">
              <p className="font-sans text-base leading-7 text-stone-500">
                Woliso Hotel is designed around simplicity and honesty — clear prices, real hospitality, and rooms that feel like home. No surprises, no hidden fees.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-stone-200 overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative bg-white p-8 transition-all duration-300 hover:bg-[#e8501e] reveal"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <span className="font-ui mb-6 block text-[11px] font-bold tracking-[0.22em] text-stone-300 group-hover:text-white/50 transition-colors">{f.n}</span>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff5f0] group-hover:bg-white/20 transition-colors">
                  <f.icon className="h-5 w-5 text-[#e8501e] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-ui mb-3 text-[16px] font-bold text-stone-900 group-hover:text-white transition-colors">{f.title}</h3>
                <p className="font-sans text-sm leading-6 text-stone-500 group-hover:text-white/70 transition-colors">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LOCATIONS / BRANCHES
      ═══════════════════════════════════════════════════ */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-16 reveal">
            <Label>Our locations</Label>
            <h2 className="font-display text-5xl font-semibold leading-[0.92] tracking-tight text-stone-900 sm:text-6xl">
              Two doors,<br />
              <em className="not-italic text-[#e8501e]">one warm welcome.</em>
            </h2>
          </div>

          {branches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {branches.map((branch: { id: string; name: string; city: string; region: string; country: string }, i: number) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => navigate(`/rooms?${new URLSearchParams({ branchId: branch.id })}`)}
                  className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#faf9f7] p-8 text-left transition-all duration-300 hover:border-[#e8501e]/25 hover:shadow-luxury-lg focus:outline-none focus:ring-2 focus:ring-[#e8501e] reveal"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {/* Corner decoration */}
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#e8501e]/5 transition-all duration-300 group-hover:bg-[#e8501e]/10" />

                  <div className="relative">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8501e] shadow-brand transition-transform duration-300 group-hover:scale-110">
                      <Hotel className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="font-display mb-1.5 text-2xl font-semibold text-stone-900">{branch.name}</h3>
                    <p className="font-ui mb-6 flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin className="h-3.5 w-3.5 text-[#e8501e]" />
                      {branch.city}, {branch.region}, {branch.country}
                    </p>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-5">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, si) => <Star key={si} className="h-4 w-4 fill-[#c9a96e] text-[#c9a96e]" />)}
                      </div>
                      <span className="font-ui flex items-center gap-1.5 text-sm font-bold text-[#e8501e] transition-transform duration-200 group-hover:translate-x-1">
                        Explore rooms <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-stone-500">{isError ? 'Could not load branches.' : 'Loading…'}</p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════ */}
      <section className="bg-stone-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-16 reveal">
            <Label>Guest stories</Label>
            <h2 className="font-display text-5xl font-semibold leading-[0.92] tracking-tight text-white sm:text-6xl">
              What our guests<br />
              <em className="not-italic text-[#c9a96e]">are saying.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#c9a96e]/30 hover:bg-white/8 reveal"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {/* Quote mark */}
                <div className="font-display absolute right-6 top-4 text-[80px] leading-none text-white/5">"</div>

                <div className="relative">
                  <div className="mb-5 flex gap-0.5">
                    {[...Array(t.rating)].map((_, si) => <Star key={si} className="h-3.5 w-3.5 fill-[#c9a96e] text-[#c9a96e]" />)}
                  </div>

                  <p className="font-sans mb-7 text-[15px] leading-[1.75] text-white/65 italic">"{t.text}"</p>

                  <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8501e] font-ui text-sm font-bold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-ui text-sm font-bold text-white">{t.name}</p>
                      <p className="font-ui text-[11px] text-white/35">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CULTURAL GUIDE
      ═══════════════════════════════════════════════════ */}
      <section className="bg-[#faf9f7] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-16 reveal">
            <Label>Know before you go</Label>
            <h2 className="font-display text-5xl font-semibold leading-[0.92] tracking-tight text-stone-900 sm:text-6xl">
              A place is<br />
              <em className="not-italic text-[#e8501e]">its people.</em>
            </h2>
            <p className="font-sans mt-5 max-w-md text-base leading-7 text-stone-500">
              A few customs and phrases from Oromia to help you feel genuinely at home in Woliso.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            {/* Tab buttons */}
            <div className="flex flex-col gap-2">
              {culturalGuides.map((g, idx) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                    activeTab === idx
                      ? 'border-[#e8501e]/20 bg-[#e8501e] text-white shadow-brand'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-luxury'
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    activeTab === idx ? 'bg-white/20' : 'bg-[#fff5f0]'
                  }`}>
                    <g.icon className={`h-4.5 h-[18px] w-[18px] ${activeTab === idx ? 'text-white' : 'text-[#e8501e]'}`} />
                  </div>
                  <span className="font-ui text-sm font-bold">{g.label}</span>
                </button>
              ))}
            </div>

            {/* Panel */}
            <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 shadow-luxury sm:p-10">
              {/* Decorative serif quote mark */}
              <div className="font-display absolute right-8 top-2 text-[120px] leading-none text-stone-50">"</div>

              <div className="relative">
                <div className="font-ui mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#e8501e]">{active.label} · Oromia</div>
                <h3 className="font-display mb-5 text-4xl font-semibold text-stone-900 sm:text-5xl">{active.title}</h3>
                <p className="font-sans max-w-xl text-base leading-7 text-stone-600">{active.body}</p>
                <div className="mt-8 flex items-center gap-3 rounded-xl bg-[#faf9f7] p-4">
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#e8501e]" />
                  <p className="font-sans text-sm italic text-stone-500">{active.tip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#1a0e08] py-24 sm:py-32">
        {/* Background image with overlay */}
        <img
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2000&q=80"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/80 to-stone-900/60" />
        {/* Gold decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="reveal">
            <Label>Ready to book</Label>
            <h2 className="font-display mt-2 text-6xl font-semibold leading-[0.92] tracking-tight text-white sm:text-7xl">
              Your next story<br />
              <em className="not-italic text-[#c9a96e]">starts here.</em>
            </h2>
            <p className="font-sans mx-auto mt-6 max-w-md text-base leading-7 text-white/55">
              Find your room at either Woliso branch and experience genuine Ethiopian hospitality at a fair price.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/rooms" className="btn-primary font-ui inline-flex items-center gap-2.5 rounded-xl px-7 py-4 text-base">
                <BedDouble className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                Browse All Rooms
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register"
                className="btn-ghost font-ui inline-flex items-center gap-2 rounded-xl border-white/30 px-7 py-4 text-base text-white hover:border-white/60 hover:bg-white/8">
                Create an account
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
