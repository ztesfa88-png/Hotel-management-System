import { useState } from 'react';
import { CreditCard, RefreshCw, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDateTime, getPaymentStatusColor } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: async () => {
      const response = await api.get('/payments', { params: { page, limit: 10 } });
      return { data: response.data.data, meta: response.data.meta };
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      api.post(`/payments/refund/${bookingId}`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Refund processed successfully');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (paymentId: string) => api.post(`/payments/${paymentId}/mark-paid`, { method: 'CASH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Cash payment recorded');
    },
  });

  const payments = data?.data || [];
  const meta = data?.meta;
  const completedOnPage = payments.filter((payment: any) => payment.status === 'COMPLETED').length;
  const attentionOnPage = payments.filter((payment: any) =>
    ['PENDING', 'PROCESSING', 'FAILED'].includes(payment.status),
  ).length;

  const handleRefund = (bookingId: string) => {
    const reason = prompt('Enter refund reason:');
    if (reason !== null) {
      refundMutation.mutate({ bookingId, reason });
    }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="page-header gap-5 rounded-[1.75rem] bg-[#173b32] px-5 py-6 text-white shadow-xl shadow-[#173b32]/10 sm:px-8 sm:py-8">
        <div>
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#c7d78d]">Finance · Transactions</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Payments</h1>
          <p className="mt-2 text-sm text-white/70 sm:text-base">A clear view of every charge, cash payment and refund.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Transactions on page', value: payments.length, accent: 'bg-[#e7eddf]', color: 'text-[#315b43]' },
          { label: 'Completed', value: completedOnPage, accent: 'bg-[#e7eddf]', color: 'text-[#315b43]' },
          { label: 'Needs attention', value: attentionOnPage, accent: 'bg-[#f8e9df]', color: 'text-[#db4930]' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] p-4 shadow-sm sm:px-5">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#73766d]">{item.label}</p>
              <p className={`mt-1 text-2xl font-black tracking-tight ${item.color}`}>{item.value}</p>
            </div>
            <span className={`h-10 w-10 rounded-xl ${item.accent}`} />
          </div>
        ))}
      </div>

      <div className="card overflow-hidden rounded-2xl border border-[#e8e4d8] bg-[#fffdfa] p-0 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#eeeae0] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#db4930]">Transaction ledger</p>
            <h2 className="mt-1 text-lg font-black tracking-tight text-[#171a17]">Payment activity</h2>
          </div>
          <p className="text-xs font-semibold text-[#73766d]">{meta?.total ?? payments.length} total</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <>
            <div className="table-container overflow-x-auto">
              <table className="table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Guest</th>
                    <th>Booking #</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="font-mono text-xs font-bold tracking-wide text-[#315b43]">{payment.invoiceNumber}</td>
                      <td>
                        <div>
                          <p className="font-medium">
                            {payment.booking?.user?.firstName} {payment.booking?.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{payment.booking?.user?.email}</p>
                        </div>
                      </td>
                      <td className="font-mono text-xs">{payment.booking?.bookingNumber}</td>
                      <td className="font-semibold text-[#171a17]">{formatCurrency(Number(payment.amount))}</td>
                      <td>
                        <span className="badge-info">{payment.method}</span>
                      </td>
                      <td>
                        <span className={getPaymentStatusColor(payment.status)}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {payment.paidAt ? formatDateTime(payment.paidAt) : '—'}
                      </td>
                      <td>
                        {['PENDING', 'PROCESSING', 'FAILED'].includes(payment.status) && (
                          <button
                            onClick={() => markPaidMutation.mutate(payment.id)}
                            disabled={markPaidMutation.isPending}
                            className="mr-2 rounded-lg p-1.5 text-[#315b43] transition-colors hover:bg-[#f3efe9] disabled:opacity-50"
                            title="Record cash payment"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {isAdmin && payment.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleRefund(payment.bookingId)}
                            className="rounded-lg p-1.5 text-[#db4930] transition-colors hover:bg-[#fbf3ee]"
                            title="Process Refund"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No payments found</p>
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
