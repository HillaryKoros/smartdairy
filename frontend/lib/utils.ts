import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
}

export function formatNumber(num: number | string | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return n.toFixed(decimals);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Cow statuses
    milking: 'bg-green-100 text-green-800',
    dry: 'bg-yellow-100 text-yellow-800',
    pregnant: 'bg-blue-100 text-blue-800',
    heifer: 'bg-purple-100 text-purple-800',
    sick: 'bg-red-100 text-red-800',
    sold: 'bg-gray-100 text-gray-800',
    dead: 'bg-gray-100 text-gray-800',
    // Task statuses
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    skipped: 'bg-gray-100 text-gray-800',
    // Payment statuses
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    // Alert severities
    info: 'bg-blue-100 text-blue-800',
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
