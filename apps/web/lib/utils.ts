import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(value: number): string {
  return Math.round(value).toString();
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
