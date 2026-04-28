"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronDown, ChevronUp, Link2, Check } from 'lucide-react'
import { FreshnessBadge } from "./freshness-badge";
import type { AIBrief } from "@/types";

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://www.africaimpactlab.com";

interface AIBriefCardProps {
  brief: AIBrief;
  compact?: boolean;
  className?: string;
  loading?: boolean;
}

function ShareBar({ brief }: { brief: AIBrief }) {
  const [copied, setCopied] = useState(false)
  const pageUrl = `${SITE_URL}/briefs`
  const text = `${brief.title} — AfricaImpactLab`

  const shareX = () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`, "_blank", "noopener")
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, "_blank", "noopener")
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(text)}`, "_blank", "noopener")
  const copyLink = async () => {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mr-1.5">Share</span>
      <button onClick={shareX} title="Share on X" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </button>
      <button onClick={shareLinkedIn} title="Share on LinkedIn" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </button>
      <button onClick={shareFacebook} title="Share on Facebook" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </button>
      <button onClick={copyLink} title="Copy link" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
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

      {/* Did you know? */}
      {!compact && brief.did_you_know && (
        <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-3">
          <span className="text-base flex-shrink-0 mt-0.5">💡</span>
          <div>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Did you know?</span>
            <p className="text-sm text-indigo-900 leading-relaxed mt-0.5">{brief.did_you_know}</p>
          </div>
        </div>
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

      {/* Share */}
      {!compact && <ShareBar brief={brief} />}
    </article>
  );
}
