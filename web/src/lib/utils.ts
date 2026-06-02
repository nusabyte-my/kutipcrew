import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = startOfTarget.getTime() - startOfNow.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function generateShareUrl(token: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/bill/${token}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function getConsequenceMessage(daysLeft: number): string {
  if (daysLeft < 0) return "CONSEQUENCES HAVE ARRIVED! 💀";
  if (daysLeft === 0) return "LAST CHANCE BEFORE CONSEQUENCES! ⚠️";
  if (daysLeft <= 3) return "CONSEQUENCES IMMINENT... 😈";
  if (daysLeft <= 7) return "Time is ticking... ⏰";
  return "Pay at your leisure... for now 😏";
}

export function formatPhone(phone: string, defaultCountry = '60'): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return digits;
  if (digits.startsWith('0') && digits.length > 1) return defaultCountry + digits.slice(1);
  if (!digits.startsWith(defaultCountry)) return defaultCountry + digits;
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    if (digits.startsWith('60') && digits.length === 11) {
      return `+60 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  }
  return phone;
}

export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}
