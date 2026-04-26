"use client";

import { useState } from "react";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import type { AIBrief } from "@/types";

interface DateGroup {
  date: string;
  label: string;
  briefs: AIBrief[];
}

const INITIAL_VISIBLE = 10;

export function BriefsHistory({ groups }: { groups: DateGroup[] }) {
  const [showAll, setShowAll] = useState(false);

  // Count total historical briefs
  const totalBriefs = groups.reduce((sum, g) => sum + g.briefs.length, 0);

  // Show only first N groups (roughly 10 briefs worth) unless expanded
  let briefCount = 0;
  const visibleGroups = showAll
    ? groups
    : groups.filter((g) => {
        if (briefCount >= INITIAL_VISIBLE) return false;
        briefCount += g.briefs.length;
        return true;
      });

  const hasMore = visibleGroups.length < groups.length;

  return (
    <div>
      <div className="border-t border-slate-200 pt-8 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Previous Briefs</h2>
        <p className="text-sm text-slate-500">
          {totalBriefs} historical brief{totalBriefs !== 1 ? 's' : ''} across {groups.length} day{groups.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-8">
        {visibleGroups.map((group) => (
          <div key={group.date}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-slate-700">{group.label}</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {group.briefs.length} brief{group.briefs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {group.briefs.map((b) => (
                <AIBriefCard key={b.id} brief={b} compact />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Open full history ({groups.length - visibleGroups.length} more day{groups.length - visibleGroups.length !== 1 ? 's' : ''})
          </button>
        </div>
      )}

      {showAll && groups.length > INITIAL_VISIBLE && (
        <div className="mt-8 text-center">
          <button
            onClick={() => { setShowAll(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Collapse history
          </button>
        </div>
      )}
    </div>
  );
}
