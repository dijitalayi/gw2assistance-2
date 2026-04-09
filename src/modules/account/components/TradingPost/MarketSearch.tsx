'use client';

import React, { useState, useEffect } from 'react';
import { marketSync } from '../../services/marketSync';
import { Search, Loader2, Database, ShieldCheck } from 'lucide-react';

interface MarketSearchProps {
  onSelect: (id: number) => void;
  onQueryChange: (query: string) => void;
}

export function MarketSearch({ onSelect, onQueryChange }: MarketSearchProps) {
  const [query, setQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setIsSyncing(marketSync.isBusy());
      setProgress(marketSync.getProgress());
      setTotalItems(marketSync.getTotalCount());
    };

    const interval = setInterval(updateStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onQueryChange(val);
  };

  return (
    <div className="relative w-full group">
      {/* Sync Status Overlay (Forum-Optimized) */}
      {isSyncing && (
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Database className="w-4 h-4 text-orange-500 animate-pulse" />
              <div className="absolute inset-0 blur-md bg-orange-500/20" />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Core Database: Indexing {totalItems.toLocaleString()} Market Assets...
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-orange-500 font-mono">{progress}%</span>
          </div>
        </div>
      )}

      {!isSyncing && (
        <div className="absolute -top-10 left-6 flex items-center gap-2 opacity-40">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Local Database Synchronized: {totalItems.toLocaleString()} Assets Locked
          </span>
        </div>
      )}

      {/* Main Search Input */}
      <div className="relative flex items-center">
        <div className="absolute left-6 text-gray-500 group-focus-within:text-orange-500 transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="SEARCH MARKET ASSETS (E.G. ECTOPLASM, MYSTIC COIN...)"
          className="w-full bg-[#111318]/60 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-sm font-black text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all tracking-widest"
        />

        {query.length > 0 && !isSyncing && (
          <div className="absolute right-6 flex items-center gap-2">
            <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[8px] font-black text-gray-600 uppercase tracking-widest">
              Press Enter to Analyze
            </div>
          </div>
        )}
      </div>

      {/* Decorative Glow */}
      <div className="absolute inset-0 -z-10 bg-orange-500/5 blur-3xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
    </div>
  );
}
