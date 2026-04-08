"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/countries", label: "Countries" },
  { href: "/sdg", label: "SDGs" },
  { href: "/briefs", label: "AI Briefs" },
  { href: "/partners", label: "Partners" },
  { href: "/impact", label: "Impact" },
  { href: "/action", label: "Take Action" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          {/* Gradient square with A lettermark */}
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-sm transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}
          >
            A
          </span>
          {/* Two-line wordmark */}
          <span className="hidden sm:flex flex-col leading-none gap-[3px]">
            <span className="text-[13px] font-bold text-slate-800 tracking-tight">
              Africa<span className="text-blue-600">Impact</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-400 tracking-[0.18em] uppercase">
              Lab
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/methodology"
            className="hidden lg:inline-flex text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Methodology
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/methodology"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Methodology
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
