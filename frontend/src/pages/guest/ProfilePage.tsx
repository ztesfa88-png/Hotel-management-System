import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

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
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-primary-700 font-bold text-xl">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </span>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="badge-info mt-1">{user?.role}</span>
        </div>
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
