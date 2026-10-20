import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save, Camera } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="card flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
          {user?.avatar ? (
            <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-primary-700">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900 text-lg">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="badge-info mt-1">{user?.role}</span>
        </div>
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
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          {uploadAvatar.isPending ? 'Uploading...' : 'Change photo'}
        </button>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="section-title">Personal Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <User className="w-4 h-4 inline mr-1" />
                First Name
              </label>
              <input
                {...register('firstName', { required: 'Required' })}
                className="input-field"
              />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input
                {...register('lastName', { required: 'Required' })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              value={user?.email}
              disabled
              className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="+1 234 567 8900"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
