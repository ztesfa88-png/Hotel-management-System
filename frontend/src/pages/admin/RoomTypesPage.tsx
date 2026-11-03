import { useEffect, useState } from 'react';
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
    <div className="space-y-7 animate-fade-in">
      <div className="page-header gap-4 rounded-[1.75rem] bg-[#173b32] px-5 py-6 text-white shadow-xl shadow-[#173b32]/10 sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#c7d78d]">Product · Room collection</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Room types</h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">Shape the stay with clear categories, thoughtful amenities and pricing.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 self-start rounded-xl bg-[#d2df9e] px-4 py-3 text-sm font-bold text-[#173b32] shadow-lg transition hover:bg-white sm:self-auto">
          <Plus className="w-4 h-4" />
          Add Room Type
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(roomTypes || []).map((rt: any) => (
            <div key={rt.id} className="relative overflow-hidden rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="h-1.5 bg-gradient-to-r from-[#315b43] via-[#c49a46] to-[#db4930]" />
              <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7eddf]">
                    <Tag className="h-5 w-5 text-[#315b43]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-[#171a17]">{rt.name}</h3>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#73766d]">{rt._count?.rooms || 0} rooms</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingType(rt)} className="rounded-lg p-1.5 text-gray-400 hover:bg-[#f3efe9] hover:text-[#315b43]">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rt.id, rt.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {rt.description && (
                <p className="mb-5 text-sm leading-relaxed text-gray-500">{rt.description}</p>
              )}

              <div className="mb-4 flex items-end justify-between border-t border-[#eeeae0] pt-4">
                <span className="text-2xl font-black tracking-tight text-[#315b43]">{formatCurrency(Number(rt.basePrice))}</span>
                <span className="pb-1 text-xs font-bold uppercase tracking-wide text-gray-500">per night</span>
              </div>

              <div className="mb-4 flex items-center justify-between rounded-xl bg-[#f5f4ed] px-3 py-2.5 text-sm">
                <span className="text-gray-500">Guest capacity</span>
                <span className="font-bold text-[#171a17]">Up to {rt.maxGuests}</span>
              </div>

              {rt.amenities && rt.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {rt.amenities.slice(0, 4).map((a: string) => (
                    <span key={a} className="rounded-full bg-[#f1efe7] px-2 py-0.5 text-xs text-[#666b60]">{a}</span>
                  ))}
                  {rt.amenities.length > 4 && (
                    <span className="rounded-full bg-[#f1efe7] px-2 py-0.5 text-xs text-[#666b60]">+{rt.amenities.length - 4}</span>
                  )}
                </div>
              )}
              </div>
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>({
    defaultValues: roomType ? {
      ...roomType,
      amenities: roomType.amenities?.join(', '),
    } : {},
  });

  useEffect(() => {
    reset(roomType ? {
      ...roomType,
      amenities: roomType.amenities?.join(', '),
    } : {});
  }, [roomType, reset]);

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
