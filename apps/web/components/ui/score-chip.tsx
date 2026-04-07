import { cn } from "@/lib/utils";

type ScoreType = "need" | "opportunity" | "stability";

interface ScoreChipProps {
  type: ScoreType;
  value: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const config: Record<ScoreType, { label: string; bg: string; text: string; border: string }> = {
  need: {
    label: "Need",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  opportunity: {
    label: "Opportunity",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  stability: {
    label: "Stability",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
};

const sizes = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-base px-3 py-1.5 gap-2",
};

export function ScoreChip({
  type,
  value,
  size = "md",
  showLabel = true,
  className,
}: ScoreChipProps) {
  const { label, bg, text, border } = config[type];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        bg,
        text,
        border,
        sizes[size],
        className
      )}
      title={`${label} score: ${Math.round(value)}/100`}
    >
      {showLabel && <span className="opacity-70">{label}</span>}
      <span className="font-bold tabular-nums">{Math.round(value)}</span>
    </span>
  );
}
