import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'react-router-dom';
import { Hotel, Eye, EyeOff, Coffee, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const requestedPath = (location.state as {
    from?: { pathname?: string; search?: string; hash?: string };
  } | null)?.from;
  const redirectTo = requestedPath?.pathname
    ? `${requestedPath.pathname}${requestedPath.search ?? ''}${requestedPath.hash ?? ''}`
    : undefined;
  const login = useLogin(redirectTo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    login.mutate(data);
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#e9bd68]">Woliso Hotel · Ethiopia</p>
            <h2 className="font-serif text-4xl leading-tight">Come in.<br /><span className="italic text-[#f2dca7]">Feel at home.</span></h2>
          </div>
          <div className="relative">
            <Coffee className="mb-3 h-6 w-6 text-[#e9bd68]" />
            <p className="max-w-xs font-serif text-xl italic text-white/90">“Baga nagaan dhuftan”</p>
            <p className="mt-2 text-sm text-white/60">A warm welcome, wherever you are from.</p>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/55"><MapPin className="h-3.5 w-3.5" /> Woliso, Oromia · Ethiopia</p>
          </div>
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18392e] text-[#e9bd68] lg:hidden">
              <Hotel className="h-6 w-6" />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a45132]">Welcome back</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#18392e]">Sign in to continue</h1>
            <p className="mt-2 text-sm text-gray-500">Access your Woliso Hotel account and reservations.</p>
          </div>


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={login.isPending}
              className="btn-primary w-full py-2.5 text-base"
            >
              {login.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#a45132] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
