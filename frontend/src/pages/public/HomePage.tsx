import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Coffee, Hotel, MapPin, Search, Shield, Utensils, Wallet } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useBranches } from '../../hooks/useRooms';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: branches = [], isError: branchesError, refetch: refetchBranches } = useBranches();
  const tomorrow = addDays(new Date(), 1);
  const dayAfter = addDays(new Date(), 3);

  const [branchId, setBranchId] = useState('');
  const [checkIn, setCheckIn] = useState(format(tomorrow, 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(dayAfter, 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({ checkIn, checkOut, guests: String(guests), branchId });
    navigate(`/rooms?${query.toString()}`);
  };

  const features = [
    { icon: MapPin, label: 'Branches around Woliso', desc: 'Choose the location that suits your journey.' },
    { icon: Wallet, label: 'Clear ETB pricing', desc: 'See room rates in Ethiopian Birr.' },
    { icon: CalendarCheck, label: 'Simple reservations', desc: 'Find a room for the dates you need.' },
    { icon: Hotel, label: 'A stay for every journey', desc: 'Explore rooms for solo, family, and group stays.' },
  ];

  const culturalGuides = [
    {
      icon: Coffee,
      label: 'Buna',
      title: 'Make time for buna',
      description: 'Coffee is often more than a drink: preparing and sharing buna makes space for conversation and connection. If you are invited to join, follow your host’s lead and enjoy the pause.',
      note: 'A small moment can make a meaningful memory.',
    },
    {
      icon: Utensils,
      label: 'At the table',
      title: 'Share a meal',
      description: 'Ethiopian meals are often served on injera, with dishes arranged for sharing. Wash your hands before eating, take your cue from those around you, and use utensils whenever you prefer.',
      note: 'Ask locally what is in season and available.',
    },
    {
      icon: MapPin,
      label: 'Afaan Oromoo',
      title: 'A few words go a long way',
      description: 'Baga nagaan dhuftan means “welcome.” Galatoomi means “thank you,” and Akkam? is a friendly “how are you?” Try a phrase, listen, and let the conversation lead.',
      note: 'Local pronunciation can vary; it is always fine to ask.',
    },
  ];
  const [activeCulture, setActiveCulture] = useState(0);
  const activeGuide = culturalGuides[activeCulture];

  return (
    <div className="bg-[#faf8f1]">
      <section className="relative isolate overflow-hidden bg-[#18392e] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage: 'linear-gradient(45deg, transparent 46%, #e9bd68 47%, #e9bd68 50%, transparent 51%), linear-gradient(-45deg, transparent 46%, #e9bd68 47%, #e9bd68 50%, transparent 51%)',
            backgroundSize: '42px 42px',
            maskImage: 'linear-gradient(90deg, transparent, black)',
          }}
        />
        <div aria-hidden="true" className="absolute -right-36 -top-48 h-[34rem] w-[34rem] rounded-full border border-[#e9bd68]/25" />
        <div aria-hidden="true" className="absolute -right-20 -top-32 h-[26rem] w-[26rem] rounded-full border border-[#e9bd68]/20" />
        <div aria-hidden="true" className="absolute right-12 top-20 hidden h-56 w-56 rounded-full bg-[#bf6842]/30 blur-3xl lg:block" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e9bd68]/40 bg-white/5 px-4 py-2 text-sm text-[#f2dca7]">
                <span className="h-2 w-2 rounded-full bg-[#e9bd68]" />
                Woliso, Oromia · Ethiopia
              </div>
              <h1 className="mb-6 text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                A warm welcome,
                <span className="mt-2 block font-serif italic text-[#e9bd68]">the Woliso way.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#e4ebe4] sm:text-xl">
                Baga nagaan dhuftan — welcome. Settle into a comfortable stay and discover the
                generous spirit of Woliso, with locations to make your journey easier.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#e9bd68]" /> {branches.length || 'Multiple'} branches in Woliso</span>
                <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4 text-[#e9bd68]" /> Rates in Ethiopian Birr</span>
              </div>
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center sm:max-w-md">
              <div aria-hidden="true" className="absolute inset-4 rotate-45 rounded-[2.5rem] border border-[#e9bd68]/50" />
              <div aria-hidden="true" className="absolute inset-12 rotate-45 rounded-[2rem] border border-white/20" />
              <div className="relative flex h-56 w-56 flex-col items-center justify-center rounded-full border border-[#f1d99c]/50 bg-[#f3e6c7] text-center text-[#18392e] shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:h-64 sm:w-64">
                <Coffee className="mb-3 h-12 w-12 stroke-[1.4] text-[#a45132]" />
                <span className="font-serif text-3xl italic">Buna</span>
                <span className="mt-1 text-xs uppercase tracking-[0.25em] text-[#596b51]">Coffee · Community · Welcome</span>
              </div>
              <span className="absolute bottom-4 right-1 rounded-full border border-white/20 bg-[#18392e]/80 px-4 py-2 text-xs tracking-[0.2em] text-[#f2dca7]">HOSPITALITY ROOTED IN PLACE</span>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 gap-4 rounded-2xl border border-white/60 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:grid-cols-2 sm:p-6 lg:grid-cols-5"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Branch
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="input-field text-gray-900"
                  required
                  disabled={branches.length === 0}
                >
                  <option value="">{branches.length ? 'Choose a branch' : 'Branches unavailable'}</option>
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
                  className="input-field text-gray-900"
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
                  className="input-field text-gray-900"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#a45132] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#873e27] focus:outline-none focus:ring-2 focus:ring-[#a45132] focus:ring-offset-2">
                  <Search className="w-4 h-4" />
                  Search Rooms
                </button>
              </div>
            </form>
            {branchesError && (
              <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-red-700">
                <span>Branch locations could not be loaded.</span>
                <button type="button" onClick={() => refetchBranches()} className="font-semibold underline">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#a45132]">Made for your journey</span>
            <h2 className="mb-4 mt-3 text-3xl font-semibold tracking-tight text-[#18392e] sm:text-4xl">A stay that feels easy</h2>
            <p className="mx-auto max-w-xl text-gray-500">
              Find your room, choose the Woliso branch that works for you, and plan with clear prices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="rounded-2xl border border-[#e8e4d9] bg-[#faf8f1] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4a458] hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#18392e] text-[#f2dca7]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold text-[#18392e]">{feature.label}</h3>
                <p className="text-sm leading-6 text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f0eadb] py-16 sm:py-20">
        <div aria-hidden="true" className="absolute -left-24 top-12 h-64 w-64 rounded-full border-[24px] border-[#d7c69b]/25" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#a45132]">A Woliso field guide</span>
            <h2 className="mb-4 mt-3 text-3xl font-semibold tracking-tight text-[#18392e] sm:text-4xl">Meet the place through its people</h2>
            <p className="leading-7 text-[#5f6659]">
              Explore a few local customs and words before you arrive. Experiences vary by host and venue, so ask locally what is available.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col gap-3" role="group" aria-label="Cultural guide topics">
              {culturalGuides.map((guide, index) => (
                <button
                  key={guide.label}
                  type="button"
                  aria-pressed={activeCulture === index}
                  onClick={() => setActiveCulture(index)}
                  className={`flex min-h-16 items-center gap-4 border px-5 py-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#a45132] focus:ring-offset-2 ${activeCulture === index ? 'border-[#18392e] bg-[#18392e] text-white' : 'border-[#d8cfb9] bg-white/60 text-[#18392e] hover:border-[#a45132]'}`}
                >
                  <guide.icon className={`h-5 w-5 shrink-0 ${activeCulture === index ? 'text-[#e9bd68]' : 'text-[#a45132]'}`} />
                  <span className="font-semibold">{guide.label}</span>
                  <span aria-hidden="true" className="ml-auto text-lg">{activeCulture === index ? '−' : '+'}</span>
                </button>
              ))}
            </div>

            <article
              aria-labelledby="culture-title"
              aria-live="polite"
              className="flex min-h-64 flex-col justify-between bg-[#18392e] p-7 text-white sm:p-9"
            >
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#e9bd68]">{activeGuide.label} · Oromia</p>
                <h3 id="culture-title" className="mb-4 font-serif text-3xl">{activeGuide.title}</h3>
                <p className="max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{activeGuide.description}</p>
              </div>
              <p className="mt-8 border-t border-white/15 pt-4 text-sm text-[#f2dca7]">{activeGuide.note}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#18392e] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#e9bd68]">Find your place</span>
              <h2 className="mb-2 mt-3 text-3xl font-semibold sm:text-4xl">Our branches, one warm welcome</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/70">Choose a Woliso Hotel branch to explore rooms and availability.</p>
          </div>
          {branches.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {branches.map((branch: { id: string; name: string; city: string; region: string; country: string }) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => navigate(`/rooms?${new URLSearchParams({ branchId: branch.id })}`)}
                  className="group rounded-2xl border border-white/15 bg-white/[0.06] p-6 text-left transition-all hover:border-[#e9bd68]/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#e9bd68]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9bd68]/15 text-[#e9bd68]">
                        <Hotel className="h-5 w-5" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{branch.name}</h3>
                      <p className="text-sm text-white/65">{branch.city}, {branch.region}, {branch.country}</p>
                    </div>
                    <span className="mt-1 rounded-full border border-white/15 p-2 text-[#e9bd68] transition-transform group-hover:translate-x-1">
                      <Search className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 text-white/75">
              <p>{branchesError ? 'Branch locations are temporarily unavailable.' : 'Branch locations are loading.'}</p>
              <Link to="/rooms" className="mt-3 inline-flex font-semibold text-[#e9bd68] underline">
                Browse all rooms
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-[#a45132]">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold">Secure booking · Clear ETB rates</span>
          </div>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[#18392e] sm:text-4xl">
            Your Woliso welcome awaits.
          </h2>
          <p className="mb-8 text-gray-500">
            Find a room at either branch and make your next stay in Woliso feel at home.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a href="/rooms" className="rounded-lg bg-[#a45132] px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-[#873e27]">
              Browse Rooms
            </a>
            <a href="/register" className="rounded-lg border border-[#18392e]/20 px-8 py-3 text-base font-semibold text-[#18392e] transition-colors hover:bg-[#f0eadb]">
              Create Account
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
