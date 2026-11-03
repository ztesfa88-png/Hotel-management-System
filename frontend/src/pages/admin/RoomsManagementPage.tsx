import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, BedDouble, Filter } from 'lucide-react';
import { useBranches, useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, useRoomTypes } from '../../hooks/useRooms';
import { formatCurrency, getRoomStatusColor } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function RoomsManagementPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const { data, isLoading } = useRooms({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
    branchId: branchFilter || undefined,
  });

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const { data: roomTypes } = useRoomTypes();
  const { data: branches = [] } = useBranches();

  const rooms = data?.data || [];
  const meta = data?.meta;

  const handleDelete = (id: string, roomNumber: string) => {
    if (confirm(`Deactivate room ${roomNumber}?`)) {
      deleteRoom.mutate(id);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header gap-4 rounded-[1.75rem] bg-[#173b32] px-5 py-6 text-white shadow-xl shadow-[#173b32]/10 sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#c7d78d]">Property · Inventory</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Rooms</h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">Room-by-room status across your hotel portfolio.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-[#171a17]">
          <Filter className="h-4 w-4 text-[#db4930]" />
          <h2 className="text-xs font-black uppercase tracking-[0.16em]">Filter room inventory</h2>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-3">
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
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-56"
          >
            <option value="">All Branches</option>
            {branches.map((branch: { id: string; name: string }) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-48"
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
      <div className="card overflow-hidden rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] p-0 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#eeeae0] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#db4930]">Live inventory</p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-[#171a17]">Room directory</h2>
          </div>
          <p className="text-xs font-semibold text-[#73766d]">{meta?.total ?? rooms.length} rooms</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="table-container overflow-x-auto">
              <table className="table min-w-[900px]">
                <thead>
                  <tr>
                    <th>Room #</th>
                    <th>Branch</th>
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
                      <td className="font-mono text-sm font-bold tracking-wide text-[#315b43]">{room.roomNumber}</td>
                      <td>{room.branch?.name}</td>
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
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(room.id, room.roomNumber)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rooms.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
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
              <div className="flex flex-col gap-3 border-t border-[#eeeae0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-[#73766d]">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)} of {meta.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 1}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= meta.totalPages}
                    className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-50"
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
        branches={branches}
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

function RoomModal({ isOpen, onClose, room, roomTypes, branches, onSubmit, isLoading }: any) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>({
    defaultValues: room || {},
  });

  useEffect(() => {
    reset(room || {});
  }, [room, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Edit Room' : 'Add New Room'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
          <select {...register('branchId', { required: 'Select a branch' })} className="input-field">
            <option value="">Select branch</option>
            {branches.map((branch: { id: string; name: string }) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          {errors.branchId && <p className="text-xs text-red-600 mt-1">{errors.branchId.message as string}</p>}
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
