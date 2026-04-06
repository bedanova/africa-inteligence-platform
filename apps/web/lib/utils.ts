import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(value: number): string {
  return Math.round(value).toString();
}

/**
 * Format a number with up to `decimals` decimal places (trailing zeros removed)
 * and narrow no-break space (U+202F) as thousands separator.
 * Examples: 1234567.8 → "1 234 567.8", 0.075 → "0.08", 42 → "42"
 */
export function formatNum(value: number, decimals = 2): string {
  const rounded = Number.isInteger(value) ? value : parseFloat(value.toFixed(decimals))
  const [intPart, decPart] = rounded.toString().split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F')
  return decPart ? `${intFormatted}.${decPart}` : intFormatted
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function freshnessLabel(level: "fresh" | "aging" | "stale"): string {
  return { fresh: "Updated today", aging: "Data aging", stale: "Stale data" }[level];
}

export function freshnessColor(level: "fresh" | "aging" | "stale"): string {
  return {
    fresh: "text-opportunity-600",
    aging: "text-stability-600",
    stale: "text-need-500",
  }[level];
}
