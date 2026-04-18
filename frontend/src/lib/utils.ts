import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'ETB'): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, formatStr = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
}

export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  return differenceInDays(end, start);
}

export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-info',
    CHECKED_IN: 'badge-success',
    CHECKED_OUT: 'badge-gray',
    CANCELLED: 'badge-danger',
    NO_SHOW: 'badge-danger',
  };
  return colors[status] || 'badge-gray';
}

export function getRoomStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'badge-success',
    OCCUPIED: 'badge-danger',
    MAINTENANCE: 'badge-warning',
    RESERVED: 'badge-info',
    OUT_OF_SERVICE: 'badge-gray',
  };
  return colors[status] || 'badge-gray';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'badge-warning',
    PROCESSING: 'badge-info',
    COMPLETED: 'badge-success',
    FAILED: 'badge-danger',
    REFUNDED: 'badge-gray',
    PARTIALLY_REFUNDED: 'badge-warning',
  };
  return colors[status] || 'badge-gray';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
