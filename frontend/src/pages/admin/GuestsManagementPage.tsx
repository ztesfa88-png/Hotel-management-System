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
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { page, limit: 10, search: search || undefined, role: 'GUEST' },
      });
      return { data: response.data.data, meta: response.data.meta };
    },
  });

  const guests = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header gap-4 rounded-[1.75rem] bg-[#173b32] px-5 py-6 text-white shadow-xl shadow-[#173b32]/10 sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#c7d78d]">Guest relations · Directory</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Guests</h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">Know your guests and keep every detail close at hand.</p>
        </div>
      </div>

      <div className="card rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#db4930]">Guest lookup</p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-[#171a17]">Search your directory</h2>
          </div>
          <span className="shrink-0 rounded-full bg-[#f3efe9] px-3 py-1 text-xs font-bold text-[#315b43]">{meta?.total ?? guests.length} guests</span>
        </div>
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

      <div className="card overflow-hidden rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] p-0 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="table-container overflow-x-auto">
              <table className="table min-w-[780px]">
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
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#173b32]">
                            <span className="text-xs font-bold text-[#e2e9bd]">
                              {getInitials(guest.firstName, guest.lastName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#171a17]">{guest.firstName} {guest.lastName}</p>
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
              <div className="flex flex-col gap-3 border-t border-[#eeeae0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-[#73766d]">
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
