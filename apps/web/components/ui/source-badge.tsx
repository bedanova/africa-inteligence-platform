import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source: string;
  year?: number;
  url?: string;
  className?: string;
}

export function SourceBadge({ source, year, url, className }: SourceBadgeProps) {
  const label = year ? `${source} (${year})` : source;

  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 font-medium hover:bg-slate-200 transition-colors",
        className
      )}
    >
      <svg
        className="w-3 h-3 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      {label}
    </span>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex">
        {inner}
      </a>
    );
  }
  return inner;
}
