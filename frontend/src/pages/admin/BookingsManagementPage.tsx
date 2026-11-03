import { useState } from 'react';
import { Search, CalendarCheck, CheckCircle, XCircle, LogIn, LogOut, Filter } from 'lucide-react';
import {
  useBookings,
  useConfirmBooking,
  useCheckIn,
  useCheckOut,
  useCancelBooking,
} from '../../hooks/useBookings';
import { formatCurrency, formatDate, getBookingStatusColor } from '../../lib/utils';
import { useBranches } from '../../hooks/useRooms';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function BookingsManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBookings({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
    branchId: branchFilter || undefined,
  });
  const { data: branches = [] } = useBranches();

  const confirmBooking = useConfirmBooking();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelBooking = useCancelBooking();

  const bookings = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header gap-4 rounded-[1.75rem] bg-[#1d1b1a] px-5 py-6 text-white shadow-xl shadow-black/15 sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#ff795f]">Front desk · Reservations</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Bookings</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">Keep every arrival, stay and departure moving smoothly.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card rounded-2xl border border-[#e8ddd5] bg-[#fffaf6] shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-[#171a17]">
          <Filter className="h-4 w-4 text-[#f05a3a]" />
          <h2 className="text-xs font-black uppercase tracking-[0.16em]">Find a reservation</h2>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking #, guest name, room..."
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
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden rounded-2xl border border-[#e8ddd5] bg-[#fffaf6] p-0 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#eeeae0] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#f05a3a]">Reservations ledger</p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-[#1d1b1a]">Booking activity</h2>
          </div>
          <p className="text-xs font-semibold text-[#736a64]">{meta?.total ?? bookings.length} total</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="table-container overflow-x-auto">
              <table className="table min-w-[1050px]">
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Branch</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => (
                    <tr key={booking.id}>
                      <td className="font-mono text-xs font-bold tracking-wide text-[#f05a3a]">{booking.bookingNumber}</td>
                      <td>
                        <div>
                          <p className="font-medium">{booking.user.firstName} {booking.user.lastName}</p>
                          <p className="text-xs text-gray-400">{booking.user.email}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium">Room {booking.room.roomNumber}</p>
                          <p className="text-xs text-gray-400">{booking.room.roomType.name}</p>
                        </div>
                      </td>
                      <td>{booking.room.branch?.name}</td>
                      <td>{formatDate(booking.checkInDate)}</td>
                      <td>{formatDate(booking.checkOutDate)}</td>
                      <td className="font-semibold">{formatCurrency(Number(booking.totalAmount))}</td>
                      <td>
                        <span className={getBookingStatusColor(booking.status)}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => confirmBooking.mutate(booking.id)}
                              title="Confirm"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => checkIn.mutate(booking.id)}
                              title="Check In"
                              className="rounded-lg p-1.5 text-primary-700 transition-colors hover:bg-primary-50"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => checkOut.mutate(booking.id)}
                              title="Check Out"
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                            <button
                              onClick={() => {
                                if (confirm('Cancel this booking?')) {
                                  cancelBooking.mutate({ id: booking.id });
                                }
                              }}
                              title="Cancel"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No bookings found</p>
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
