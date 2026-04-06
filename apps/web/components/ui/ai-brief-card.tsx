"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { FreshnessBadge } from "./freshness-badge";
import type { AIBrief } from "@/types";

interface AIBriefCardProps {
  brief: AIBrief;
  compact?: boolean;
  className?: string;
  loading?: boolean;
}

export function AIBriefCard({ brief, compact = false, className, loading }: AIBriefCardProps) {
  const [showCitations, setShowCitations] = useState(false);

  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-100 p-5 shadow-sm", className)}>
        <div className="skeleton h-3 w-20 mb-3 rounded" />
        <div className="skeleton h-5 w-3/4 mb-2 rounded" />
        <div className="skeleton h-4 w-full mb-1 rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
      </div>
    );
  }

  const scopeLabel = {
    continent: "Africa Overview",
    country: brief.country_iso3 ?? "Country",
    theme: "Thematic Brief",
  }[brief.scope];

  const officialCount = brief.citations.filter((c) => c.source_type === "official_data").length;
  const newsCount = brief.citations.filter((c) => c.source_type === "trusted_news").length;

  return (
    <article
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow",
        brief.freshness === "stale" && "border-amber-200 bg-amber-50/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          {scopeLabel}
        </span>
        <FreshnessBadge freshness={brief.freshness} updatedAt={brief.generated_at} />
        {brief.freshness === "stale" && (
          <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
            Using last valid snapshot
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-900 mb-2 leading-snug">{brief.title}</h3>

      {/* Summary */}
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{brief.summary}</p>

      {/* Bullets */}
      {!compact && brief.bullets.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {brief.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {/* Risk flags */}
      {!compact && brief.risk_flags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {brief.risk_flags.map((flag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              {flag}
            </span>
          ))}
        </div>
      )}

      {/* Citations toggle */}
      <div className="border-t border-slate-100 pt-3 mt-3">
        <button
          onClick={() => setShowCitations((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
          {officialCount} official source{officialCount !== 1 ? "s" : ""}
          {newsCount > 0 && `, ${newsCount} news item${newsCount !== 1 ? "s" : ""}`}
          {showCitations ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {showCitations && (
          <div className="mt-2 space-y-1">
            {brief.citations.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    c.source_type === "official_data" ? "bg-blue-400" : "bg-slate-400"
                  )}
                />
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {c.label}
                  </a>
                ) : (
                  <span className="text-slate-600">{c.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
