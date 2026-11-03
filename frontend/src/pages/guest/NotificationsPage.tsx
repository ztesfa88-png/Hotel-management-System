import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { formatDateTime } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      <header className="grid gap-6 border-b border-[#ded9ce] pb-7 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e65332]">The latest from your stay</p>
          <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.06em] text-[#1b1b1b] sm:text-7xl">In the know<span className="text-[#ff5b35]">.</span></h1>
          <p className="mt-4 text-sm text-[#77766e]">
            {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'} waiting for you.` : 'A record of the latest updates from your hotel.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="inline-flex items-center justify-center gap-2 border border-[#1b1b1b] px-4 py-3 text-sm font-semibold text-[#1b1b1b] transition hover:bg-[#1b1b1b] hover:text-white disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            {markAllAsRead.isPending ? 'Updating...' : 'Mark all read'}
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <div className="grid gap-6 border border-[#ded9ce] bg-[#f3f1e9] p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e65332]">All caught up</p>
            <h2 className="text-3xl font-black tracking-tight text-[#1b1b1b]">Quiet, in the best way.</h2>
            <p className="mt-3 text-sm text-[#77766e]">When there’s news about your stay, you’ll find it here.</p>
          </div>
          <div className="hidden h-20 w-20 items-center justify-center border border-[#ded9ce] bg-[#fffdfa] sm:flex">
            <Bell className="h-8 w-8 text-[#ff5b35]" strokeWidth={1.5} />
          </div>
        </div>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#89877f]">Your updates</p>
            <p className="text-xs text-[#89877f]">{notifications.length} total</p>
          </div>
          <div className="divide-y divide-[#ded9ce] border-y border-[#ded9ce]">
            {notifications.map((notification: any, index: number) => (
              <article
                key={notification.id}
                className={`group relative grid cursor-pointer gap-4 py-5 pl-4 pr-3 transition sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:py-7 sm:pl-5 ${
                  !notification.isRead ? 'bg-[#fff0eb] hover:bg-[#ffe6de]' : 'bg-[#fffdfa] hover:bg-[#f3f2ee]'
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead.mutate(notification.id);
                  }
                }}
              >
                <span className={`absolute bottom-0 left-0 top-0 w-1 ${!notification.isRead ? 'bg-[#ff5b35]' : 'bg-transparent group-hover:bg-[#ded9ce]'}`} />
                <div className={`flex h-11 w-11 items-center justify-center ${!notification.isRead ? 'bg-[#1b1b1b] text-white' : 'bg-[#f0eee8] text-[#89877f]'}`}>
                  {!notification.isRead ? <Bell className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`text-base font-semibold leading-snug ${!notification.isRead ? 'text-[#1b1b1b]' : 'text-[#454b43]'}`}>
                      {notification.title}
                    </h2>
                    {!notification.isRead && <span className="bg-[#ff5b35] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#1b1b1b]">New</span>}
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6f7069]">{notification.message}</p>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#89877f]">{formatDateTime(notification.createdAt)}</p>
                </div>
                <span className="hidden self-center text-[10px] font-bold uppercase tracking-[0.13em] text-[#89877f] sm:block">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
