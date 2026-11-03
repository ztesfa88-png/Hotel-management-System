import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'react-router-dom';
import { Hotel, Eye, EyeOff, Star } from 'lucide-react';
import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const redirectTo = from?.pathname ? `${from.pathname}${from.search ?? ''}` : undefined;
  const login = useLogin(redirectTo);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <div className="flex min-h-[calc(100vh-68px)] bg-[#faf9f7]">

      {/* Left: photo panel */}
      <div className="relative hidden overflow-hidden bg-stone-900 lg:flex lg:w-[48%]">
        <img
          src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/50 to-stone-900/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8501e] shadow-brand">
              <Hotel className="h-[18px] w-[18px] text-white" />
            </div>
            <div>
              <span className="font-display block text-xl font-semibold text-white">Woliso</span>
              <span className="font-ui block text-[8.5px] uppercase tracking-[0.22em] text-white/30 mt-0.5">Hotel · Ethiopia</span>
            </div>
          </Link>

          {/* Headline */}
          <div>
            <div className="mb-5 flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#c9a96e] text-[#c9a96e]" />)}
            </div>
            <h2 className="font-display text-5xl font-semibold leading-[0.92] text-white xl:text-6xl">
              Come in.<br />
              <em className="not-italic text-[#c9a96e]">Stay a while.</em>
            </h2>
            <p className="font-sans mt-5 text-base leading-7 text-white/50">
              "Baga nagaan dhuftan" — a warm welcome wherever you are from.
            </p>
          </div>

          {/* Bottom quote */}
          <blockquote className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="font-sans text-sm leading-6 italic text-white/55">
              "The stay was perfect — warm, honest, and exactly what Woliso has to offer."
            </p>
            <footer className="font-ui mt-3 text-xs text-[#c9a96e]">— A recent guest</footer>
          </blockquote>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8501e]">
              <Hotel className="h-[17px] w-[17px] text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-stone-900">Woliso Hotel</span>
          </div>

          <p className="font-ui mb-1.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#e8501e]">
            <span className="h-px w-6 bg-[#e8501e]" /> Welcome back
          </p>
          <h1 className="font-display text-4xl font-semibold text-stone-900 sm:text-5xl">Sign in</h1>
          <p className="font-sans mt-2 text-sm text-stone-500">Access your account and reservations.</p>

          <form onSubmit={handleSubmit((d) => login.mutate(d))} className="mt-8 space-y-5">
            <div>
              <label className="font-ui mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="email"
                className="input-field" />
              {errors.email && <p className="mt-1.5 font-ui text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="font-ui mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Password</label>
              <div className="relative">
                <input {...register('password')} type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  className="input-field pr-11" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700 transition-colors">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 font-ui text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={login.isPending}
              className="btn-primary font-ui w-full rounded-xl py-3.5 text-[15px] disabled:opacity-50">
              {login.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="font-ui mt-7 text-center text-sm text-stone-500">
            No account yet?{' '}
            <Link to="/register" className="font-bold text-[#e8501e] hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
