import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Hotel, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useRegister } from '../../hooks/useAuth';

const schema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName:  z.string().min(2, 'At least 2 characters'),
  email:     z.string().email('Invalid email'),
  phone:     z.string().optional(),
  password:  z.string().min(8, 'At least 8 characters')
    .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 'Include uppercase, lowercase & number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const [show, setShow] = useState(false);
  const mut = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const onSubmit = ({ confirmPassword, ...d }: Form) => mut.mutate(d);

  return (
    <div className="flex min-h-[calc(100vh-68px)] bg-[#faf9f7]">

      {/* Left photo panel */}
      <div className="relative hidden overflow-hidden bg-stone-900 lg:flex lg:w-[48%]">
        <img
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/50 to-stone-900/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8501e] shadow-brand">
              <Hotel className="h-[18px] w-[18px] text-white" />
            </div>
            <div>
              <span className="font-display block text-xl font-semibold text-white">Woliso</span>
              <span className="font-ui block text-[8.5px] uppercase tracking-[0.22em] text-white/30 mt-0.5">Hotel · Ethiopia</span>
            </div>
          </Link>

          <div>
            <h2 className="font-display text-5xl font-semibold leading-[0.92] text-white xl:text-6xl">
              Make room<br />
              <em className="not-italic text-[#c9a96e]">for a new journey.</em>
            </h2>
            <p className="font-sans mt-5 text-base leading-7 text-white/50">
              Join Woliso Hotel and keep all your reservations in one place with total clarity.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Browse and book rooms instantly',
              'Transparent ETB pricing — no surprises',
              'Manage all your stays in one account',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
                <span className="font-sans">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-sm">

          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8501e]">
              <Hotel className="h-[17px] w-[17px] text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-stone-900">Woliso Hotel</span>
          </div>

          <p className="font-ui mb-1.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#e8501e]">
            <span className="h-px w-6 bg-[#e8501e]" /> Join us
          </p>
          <h1 className="font-display text-4xl font-semibold text-stone-900 sm:text-5xl">Create account</h1>
          <p className="font-sans mt-2 text-sm text-stone-500">Book your stay and manage reservations in one place.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-ui mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">First name</label>
                <input {...register('firstName')} type="text" placeholder="Abebe" className="input-field" />
                {errors.firstName && <p className="mt-1 font-ui text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="font-ui mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Last name</label>
                <input {...register('lastName')} type="text" placeholder="Tekle" className="input-field" />
                {errors.lastName && <p className="mt-1 font-ui text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="font-ui mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
              {errors.email && <p className="mt-1 font-ui text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="font-ui mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                Phone <span className="font-normal normal-case text-stone-400">(optional)</span>
              </label>
              <input {...register('phone')} type="tel" placeholder="+251 9XX XXX XXX" className="input-field" />
            </div>

            <div>
              <label className="font-ui mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Password</label>
              <div className="relative">
                <input {...register('password')} type={show ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-11" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700 transition-colors">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 font-ui text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="font-ui mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Confirm password</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input-field" />
              {errors.confirmPassword && <p className="mt-1 font-ui text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={mut.isPending}
              className="btn-primary font-ui mt-1 w-full rounded-xl py-3.5 text-[15px] disabled:opacity-50">
              {mut.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="font-ui mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#e8501e] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
