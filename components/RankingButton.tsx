"use client";

import { useState, useEffect, useRef } from "react";

interface RankingEntry {
  username: string;
  racha_maxima: number;
}

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

function abbreviateName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 2) return name;
  const initials = parts.slice(1).map((p) => p[0].toUpperCase() + ".").join(" ");
  return `${parts[0]} ${initials}`;
}

const RankingButton = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setRanking(data.ranking);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const rankingList = (
    <>
      {loading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-sm text-yellow-400" />
        </div>
      ) : ranking.length === 0 ? (
        <p className="text-center text-xs text-gray-500 py-6">Sin datos aún</p>
      ) : (
        <ul className="py-1">
          {ranking.map((entry, i) => (
            <li
              key={entry.username}
              className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-500/5 transition-colors"
            >
              <span className="w-5 text-center text-sm shrink-0">
                {MEDAL[i] ?? <span className="text-xs text-gray-400 font-mono">{i + 1}</span>}
              </span>
              <span className="flex-1 text-sm text-yellow-100 truncate">{abbreviateName(entry.username)}</span>
              <span className="text-xs font-bold text-orange-400 shrink-0">🔥 {entry.racha_maxima}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/50 bg-black/40 text-yellow-300 text-sm font-semibold hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-200 shadow-md focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M5.166 3a1 1 0 00-.986 1.164l.757 5.31A4.501 4.501 0 009.5 13.5a4.5 4.5 0 004.563-3.926l.758-5.31A1 1 0 0013.834 3H5.166zM9.5 11.5a3 3 0 110-6 3 3 0 010 6zm0 3.5a.75.75 0 01.75.75v1h1.5a.75.75 0 010 1.5h-4.5a.75.75 0 010-1.5h1.5v-1A.75.75 0 019.5 15z" clipRule="evenodd" />
          <path d="M3.75 3a.75.75 0 00-.75.75v.75c0 1.34.394 2.582 1.068 3.623A3.002 3.002 0 011.5 10.5a.75.75 0 001.5 0 1.5 1.5 0 011.5-1.5.75.75 0 00.75-.75V3.75A.75.75 0 003.75 3zM15.25 3a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75 1.5 1.5 0 011.5 1.5.75.75 0 001.5 0 3.002 3.002 0 00-2.568-2.953A6.018 6.018 0 0017 4.5v-.75A.75.75 0 0015.25 3z" />
        </svg>
        Ranking
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Desktop dropdown (lg+) */}
      {isOpen && (
        <div className="hidden lg:block absolute left-0 z-20 mt-2 w-[28rem]">
          <div className="rounded-xl border border-yellow-500/30 bg-gray-900/95 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-yellow-500/20">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Top racha máxima</span>
            </div>
            {rankingList}
          </div>
        </div>
      )}

      {/* Mobile modal (below lg) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="rounded-2xl border border-yellow-500/30 bg-gray-900/95 shadow-2xl overflow-hidden w-[min(22rem,calc(100vw-2rem))]">
            <div className="px-4 py-3 border-b border-yellow-500/20 flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Top racha máxima</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-yellow-400/60 hover:text-yellow-300 transition-colors focus:outline-none"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            {rankingList}
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingButton;
