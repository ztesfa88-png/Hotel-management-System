import { useState } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatCurrency, formatDateTime, getPaymentStatusColor } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: () =>
      api.get('/payments', { params: { page, limit: 10 } }).then((r) => r.data.data),
  });

  const refundMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      api.post(`/payments/refund/${bookingId}`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Refund processed successfully');
    },
  });

  const payments = data?.data || [];
  const meta = data?.meta;

  const handleRefund = (bookingId: string) => {
    const reason = prompt('Enter refund reason:');
    if (reason !== null) {
      refundMutation.mutate({ bookingId, reason });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all payment transactions</p>
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
                      <td className="font-mono text-xs">{payment.invoiceNumber}</td>
                      <td>
                        <div>
                          <p className="font-medium">
                            {payment.booking?.user?.firstName} {payment.booking?.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{payment.booking?.user?.email}</p>
                        </div>
                      </td>
                      <td className="font-mono text-xs">{payment.booking?.bookingNumber}</td>
                      <td className="font-semibold">{formatCurrency(Number(payment.amount))}</td>
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
                        {payment.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleRefund(payment.bookingId)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
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
