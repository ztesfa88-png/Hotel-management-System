import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save, Camera, ArrowUpRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useRef } from 'react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.patch(`/users/${user?.id}`, data),
    onSuccess: (response) => {
      updateUser(response.data.data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated successfully');
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (response) => {
      updateUser(response.data.data);
      toast.success('Profile photo updated');
    },
  });

  const onSubmit = (data: any) => {
    updateProfile.mutate(data);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      <header className="border-b border-[#ded9ce] pb-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e65332]">A little about you</p>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.06em] text-[#1b1b1b] sm:text-7xl">Your profile<span className="text-[#ff5b35]">.</span></h1>
            <p className="mt-4 text-sm text-[#77766e]">The details that make every stay feel like yours.</p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#89877f]">Guest account <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="relative overflow-hidden bg-[#1b1b1b] p-6 text-white sm:p-8">
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff5b35]">Your account</p>
            <div className="mt-8 flex h-24 w-24 items-center justify-center overflow-hidden border border-white/20 bg-white/10">
              {user?.avatar ? (
                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black tracking-wide text-[#ff8a6e]">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">{user?.firstName} {user?.lastName}</h2>
            <p className="mt-1 break-all text-sm text-white/65">{user?.email}</p>
            <span className="mt-4 inline-block border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff8a6e]">{user?.role}</span>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  toast.error('Profile photos must be 5 MB or smaller');
                } else if (file) {
                  uploadAvatar.mutate(file);
                }
                event.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 border border-[#ff5b35] px-4 py-3 text-sm font-semibold text-[#ff8a6e] transition hover:bg-[#ff5b35] hover:text-[#1b1b1b] disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {uploadAvatar.isPending ? 'Uploading...' : 'Change photo'}
            </button>
            <p className="mt-3 text-center text-xs text-white/50">JPG, PNG, GIF or WEBP · max 5 MB</p>
          </div>
        </aside>

        <section className="border border-[#ded9ce] bg-[#fffdfa]">
          <div className="flex items-start justify-between gap-4 border-b border-[#ded9ce] bg-[#f3f1e9] px-5 py-5 sm:px-8">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e65332]">Personal details</p>
              <h2 className="text-2xl font-bold tracking-tight text-[#1b1b1b]">Information</h2>
            </div>
            <User className="mt-2 h-5 w-5 text-[#e65332]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-5 sm:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77766e]">
                  <User className="mr-1 inline h-3.5 w-3.5" />
                  First name
                </label>
                <input
                  {...register('firstName', { required: 'Required' })}
                  className="input-field rounded-none border-[#ded9ce] bg-white focus:border-[#ff5b35] focus:ring-[#ff5b35]/20"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message as string}</p>}
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77766e]">Last name</label>
                <input
                  {...register('lastName', { required: 'Required' })}
                  className="input-field rounded-none border-[#ded9ce] bg-white focus:border-[#ff5b35] focus:ring-[#ff5b35]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77766e]">
                <Mail className="mr-1 inline h-3.5 w-3.5" />
                Email address
              </label>
              <input
                value={user?.email}
                disabled
                className="input-field cursor-not-allowed rounded-none border-[#e7e1d5] bg-[#f3f2ee] text-[#8b897f]"
              />
              <p className="mt-2 text-xs text-[#8b897f]">Email address cannot be changed.</p>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77766e]">
                <Phone className="mr-1 inline h-3.5 w-3.5" />
                Phone number
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+1 234 567 8900"
                className="input-field rounded-none border-[#ded9ce] bg-white focus:border-[#ff5b35] focus:ring-[#ff5b35]/20"
              />
            </div>

            <div className="border-t border-[#ded9ce] pt-5">
              <button
                type="submit"
                disabled={!isDirty || updateProfile.isPending}
                className="inline-flex items-center justify-center gap-2 bg-[#1b1b1b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updateProfile.isPending ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
