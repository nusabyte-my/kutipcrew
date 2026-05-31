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

export function getDaysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
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
