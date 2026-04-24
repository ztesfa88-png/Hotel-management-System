import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType } from '../../hooks/useRooms';
import { formatCurrency } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';

export default function RoomTypesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);

  const { data: roomTypes, isLoading } = useRoomTypes();
  const createRoomType = useCreateRoomType();
  const updateRoomType = useUpdateRoomType();
  const deleteRoomType = useDeleteRoomType();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete room type "${name}"? This cannot be undone.`)) {
      deleteRoomType.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Types</h1>
          <p className="text-gray-500 text-sm mt-1">Manage room categories and pricing</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Room Type
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(roomTypes || []).map((rt: any) => (
            <div key={rt.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{rt.name}</h3>
                    <p className="text-xs text-gray-500">{rt._count?.rooms || 0} rooms</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingType(rt)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rt.id, rt.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {rt.description && (
                <p className="text-sm text-gray-500 mb-3">{rt.description}</p>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-primary-600">{formatCurrency(Number(rt.basePrice))}</span>
                <span className="text-sm text-gray-500">per night</span>
              </div>

              <div className="text-sm text-gray-500 mb-3">
                Max {rt.maxGuests} guests
              </div>

              {rt.amenities && rt.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {rt.amenities.slice(0, 4).map((a: string) => (
                    <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                  {rt.amenities.length > 4 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">+{rt.amenities.length - 4}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <RoomTypeModal
        isOpen={showCreateModal || !!editingType}
        onClose={() => { setShowCreateModal(false); setEditingType(null); }}
        roomType={editingType}
        onSubmit={(data: Record<string, unknown>) => {
          if (editingType) {
            updateRoomType.mutate({ id: editingType.id, data }, { onSuccess: () => setEditingType(null) });
          } else {
            createRoomType.mutate(data, { onSuccess: () => setShowCreateModal(false) });
          }
        }}
        isLoading={createRoomType.isPending || updateRoomType.isPending}
      />
    </div>
  );
}

function RoomTypeModal({ isOpen, onClose, roomType, onSubmit, isLoading }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm<Record<string, unknown>>({
    defaultValues: roomType ? {
      ...roomType,
      amenities: roomType.amenities?.join(', '),
    } : {},
  });

  const handleFormSubmit = (data: Record<string, unknown>) => {
    const amenities = (data.amenities as string)
      ? (data.amenities as string).split(',').map((a: string) => a.trim()).filter(Boolean)
      : [];
    onSubmit({ ...data, amenities, basePrice: Number(data.basePrice), maxGuests: Number(data.maxGuests) });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={roomType ? 'Edit Room Type' : 'Add Room Type'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
          <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Deluxe Suite" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="Room description..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (ETB/night)</label>
            <input {...register('basePrice', { required: 'Required', min: { value: 899.99, message: 'Minimum price is ETB 899.99' }, max: { value: 4999.99, message: 'Maximum price is ETB 4,999.99' } })} type="number" step="0.01" min="899.99" max="4999.99" className="input-field" placeholder="899.99" />
            {errors.basePrice && <p className="text-xs text-red-600 mt-1">{errors.basePrice.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Guests</label>
            <input {...register('maxGuests', { required: 'Required' })} type="number" min="1" className="input-field" placeholder="2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amenities (comma-separated)</label>
          <input {...register('amenities')} className="input-field" placeholder="WiFi, TV, Air Conditioning, Mini Fridge" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Saving...' : roomType ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
