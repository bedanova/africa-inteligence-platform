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
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  opportunity: {
    label: "Opportunity",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  stability: {
    label: "Stability",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
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
