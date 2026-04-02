import { cn } from "@/lib/utils";
import type { Freshness } from "@/types";

interface FreshnessBadgeProps {
  freshness: Freshness;
  updatedAt?: string;
  className?: string;
}

const config: Record<Freshness, { dot: string; text: string; label: string }> = {
  fresh: {
    dot: "bg-green-500",
    text: "text-green-700",
    label: "Updated today",
  },
  aging: {
    dot: "bg-yellow-500",
    text: "text-yellow-700",
    label: "Data aging",
  },
  stale: {
    dot: "bg-red-400",
    text: "text-red-600",
    label: "Stale data",
  },
};

export function FreshnessBadge({ freshness, updatedAt, className }: FreshnessBadgeProps) {
  const { dot, text, label } = config[freshness];
  const title = updatedAt ? `Last updated: ${new Date(updatedAt).toLocaleString()}` : label;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs font-medium", text, className)}
      title={title}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dot)} aria-hidden />
      {label}
    </span>
  );
}
