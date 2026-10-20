import { useEffect, useState } from 'react';
import { Building2, MapPin, Pencil, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Branch,
  useBranches,
  useCreateBranch,
  useUpdateBranch,
} from '../../hooks/useRooms';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';

type BranchForm = Omit<Branch, 'id'>;

export default function BranchesManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const { data: branches = [], isLoading, isError } = useBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBranch(null);
  };

  const handleSubmit = (data: BranchForm) => {
    const normalized = {
      name: data.name.trim(),
      city: data.city.trim(),
      region: data.region.trim(),
      country: data.country.trim(),
    };

    if (editingBranch) {
      updateBranch.mutate(
        { id: editingBranch.id, data: normalized },
        { onSuccess: closeModal },
      );
    } else {
      createBranch.mutate(normalized, { onSuccess: closeModal });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hotel Branches</h1>
          <p className="mt-1 text-sm text-gray-500">Manage locations and branch details</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : isError ? (
        <div className="card text-center text-sm text-red-600">
          Branches could not be loaded. Please try again.
        </div>
      ) : branches.length === 0 ? (
        <div className="card py-12 text-center">
          <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">No branches have been added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch: Branch & { _count?: { rooms: number } }) => (
            <article key={branch.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    <Building2 className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900">{branch.name}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {branch.city}, {branch.region}, {branch.country}
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      {branch._count?.rooms ?? 0} rooms
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Edit ${branch.name}`}
                  onClick={() => setEditingBranch(branch)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <BranchModal
        key={editingBranch?.id ?? (showCreateModal ? 'create' : 'closed')}
        isOpen={showCreateModal || !!editingBranch}
        branch={editingBranch}
        isLoading={createBranch.isPending || updateBranch.isPending}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

interface BranchModalProps {
  isOpen: boolean;
  branch: Branch | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: BranchForm) => void;
}

function BranchModal({ isOpen, branch, isLoading, onClose, onSubmit }: BranchModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchForm>({
    defaultValues: {
      name: branch?.name ?? '',
      city: branch?.city ?? '',
      region: branch?.region ?? '',
      country: branch?.country ?? 'Ethiopia',
    },
  });

  useEffect(() => {
    reset({
      name: branch?.name ?? '',
      city: branch?.city ?? '',
      region: branch?.region ?? '',
      country: branch?.country ?? 'Ethiopia',
    });
  }, [branch, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branch ? 'Edit Branch' : 'Add Branch'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {([
          ['name', 'Branch name', 'Woliso Hotel - Branch No. 3'],
          ['city', 'City', 'Woliso'],
          ['region', 'Region', 'Oromia'],
          ['country', 'Country', 'Ethiopia'],
        ] as const).map(([field, label, placeholder]) => (
          <div key={field}>
            <label htmlFor={`branch-${field}`} className="mb-1.5 block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              id={`branch-${field}`}
              {...register(field, {
                required: `${label} is required`,
                minLength: { value: 2, message: 'Enter at least 2 characters' },
              })}
              className="input-field"
              placeholder={placeholder}
              maxLength={100}
            />
            {errors[field] && (
              <p className="mt-1 text-xs text-red-600">{errors[field]?.message}</p>
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Saving...' : branch ? 'Save Changes' : 'Create Branch'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
