import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: string, currency: string = "ETH"): string {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return `0 ${currency}`;
  
  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
  
  return `${formatted} ${currency}`;
}

export function formatTimestamp(timestamp: string): string {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24 && diffInHours >= 0) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  return format(date, 'MMM d, yyyy');
}

export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: () => void
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch (err) {
    console.error('Failed to copy:', err);
    onError?.();
  }
}

export function calculateTransactionFee(gasLimit: string, gasPrice: string): number {
  const limit = parseFloat(gasLimit || '0');
  const price = parseFloat(gasPrice || '0');
  return limit * price;
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

