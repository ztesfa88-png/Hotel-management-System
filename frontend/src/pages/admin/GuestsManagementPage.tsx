import { useState } from 'react';
import { Search, Users, Mail, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate, getInitials } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function GuestsManagementPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', 'guests', page, search],
    queryFn: () =>
      api.get('/users', { params: { page, limit: 10, search: search || undefined, role: 'GUEST' } })
        .then((r) => r.data.data),
  });

  const guests = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guests Management</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage hotel guests</p>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search guests by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="card p-0">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="table-container rounded-xl">
              <table className="table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Bookings</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest: any) => (
                    <tr key={guest.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 font-semibold text-xs">
                              {getInitials(guest.firstName, guest.lastName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {guest.email}
                        </div>
                      </td>
                      <td>
                        {guest.phone ? (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {guest.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td>
                        <span className="font-medium">{guest._count?.bookings || 0}</span>
                      </td>
                      <td>{formatDate(guest.createdAt)}</td>
                      <td>
                        <span className={guest.isActive ? 'badge-success' : 'badge-danger'}>
                          {guest.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {guests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No guests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)} of {meta.total}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Previous</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
