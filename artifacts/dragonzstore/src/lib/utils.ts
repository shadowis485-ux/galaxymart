import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtLTC(n: any): string {
  if (n == null || n === '' || n === undefined) return '—';
  const num = Number(n);
  if (isNaN(num)) return '—';
  const clean = parseFloat(num.toFixed(8)).toString();
  return `$${clean} LTC`;
}
