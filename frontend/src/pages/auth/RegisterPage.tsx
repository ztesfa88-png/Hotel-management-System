import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Hotel, Eye, EyeOff, Coffee, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useRegister } from '../../hooks/useAuth';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'Password must contain uppercase, lowercase, and number/special character',
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = ({ confirmPassword, ...data }: RegisterForm) => {
    register.mutate(data);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f0eadb] px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#e1dac8] bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-[#18392e] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute -right-32 -top-24 h-96 w-96 rounded-full border border-[#e9bd68]/30" />
          <div aria-hidden="true" className="absolute -right-16 top-0 h-64 w-64 rounded-full border border-[#e9bd68]/20" />
          <div className="relative">
            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9bd68] text-[#18392e]">
              <Hotel className="h-6 w-6" />
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#e9bd68]">Your next Woliso stay</p>
            <h2 className="font-serif text-4xl leading-tight">Make room<br /><span className="italic text-[#f2dca7]">for a new journey.</span></h2>
          </div>
          <div className="relative">
            <Coffee className="mb-3 h-6 w-6 text-[#e9bd68]" />
            <p className="max-w-xs font-serif text-xl italic text-white/90">A place to rest. A place to connect.</p>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/55"><MapPin className="h-3.5 w-3.5" /> Woliso, Oromia · Ethiopia</p>
          </div>
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          <div className="mb-7 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18392e] text-[#e9bd68] lg:hidden">
              <Hotel className="h-6 w-6" />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a45132]">Join us</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#18392e]">Create your account</h1>
            <p className="mt-2 text-sm text-gray-500">Book your stay and keep your reservations together.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  {...formRegister('firstName')}
                  type="text"
                  placeholder="John"
                  className="input-field"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <input
                  {...formRegister('lastName')}
                  type="text"
                  placeholder="Doe"
                  className="input-field"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                {...formRegister('email')}
                type="email"
                placeholder="you@example.com"
                className="input-field"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone (optional)
              </label>
              <input
                {...formRegister('phone')}
                type="tel"
                placeholder="+251 9XX XXX XXX"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...formRegister('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                {...formRegister('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={register.isPending}
              className="btn-primary w-full py-2.5 text-base mt-2"
            >
              {register.isPending ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#a45132] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
