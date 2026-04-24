import { useState } from 'react';
import { Plus, Search, Edit, Trash2, BedDouble, Filter } from 'lucide-react';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, useRoomTypes } from '../../hooks/useRooms';
import { formatCurrency, getRoomStatusColor } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function RoomsManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const { data, isLoading } = useRooms({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const { data: roomTypes } = useRoomTypes();

  const rooms = data?.data || [];
  const meta = data?.meta;

  const handleDelete = (id: string, roomNumber: string) => {
    if (confirm(`Deactivate room ${roomNumber}?`)) {
      deleteRoom.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Rooms Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage hotel rooms and their availability</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RESERVED">Reserved</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="table-container rounded-xl">
              <table className="table">
                <thead>
                  <tr>
                    <th>Room #</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>Price/Night</th>
                    <th>Max Guests</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room: any) => (
                    <tr key={room.id}>
                      <td className="font-semibold">{room.roomNumber}</td>
                      <td>{room.roomType?.name}</td>
                      <td>Floor {room.floor}</td>
                      <td>{formatCurrency(Number(room.roomType?.basePrice))}</td>
                      <td>{room.roomType?.maxGuests} guests</td>
                      <td>
                        <span className={getRoomStatusColor(room.status)}>
                          {room.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingRoom(room)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room.id, room.roomNumber)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rooms.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <BedDouble className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No rooms found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)} of {meta.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= meta.totalPages}
                    className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <RoomModal
        isOpen={showCreateModal || !!editingRoom}
        onClose={() => { setShowCreateModal(false); setEditingRoom(null); }}
        room={editingRoom}
        roomTypes={roomTypes || []}
        onSubmit={(data: Record<string, unknown>) => {
          if (editingRoom) {
            updateRoom.mutate({ id: editingRoom.id, data }, {
              onSuccess: () => { setEditingRoom(null); },
            });
          } else {
            createRoom.mutate(data, {
              onSuccess: () => { setShowCreateModal(false); },
            });
          }
        }}
        isLoading={createRoom.isPending || updateRoom.isPending}
      />
    </div>
  );
}

function RoomModal({ isOpen, onClose, room, roomTypes, onSubmit, isLoading }: any) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>({
    defaultValues: room || {},
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Edit Room' : 'Add New Room'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Number</label>
            <input
              {...register('roomNumber', { required: 'Required' })}
              className="input-field"
              placeholder="101"
              disabled={!!room}
            />
            {errors.roomNumber && <p className="text-xs text-red-600 mt-1">{errors.roomNumber.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Floor</label>
            <input
              {...register('floor', { required: 'Required', valueAsNumber: true })}
              type="number"
              min="1"
              className="input-field"
              placeholder="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type</label>
          <select {...register('roomTypeId', { required: 'Required' })} className="input-field">
            <option value="">Select room type</option>
            {roomTypes.map((rt: any) => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select {...register('status')} className="input-field">
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="Optional description..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
