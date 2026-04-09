'use client';

import React, { useState, useEffect } from 'react';
import { MarketSearch } from '@/modules/account/components/TradingPost/MarketSearch';
import { MarketAnalysisTerminal } from '@/modules/account/components/TradingPost/MarketAnalysisTerminal';
import { MarketResultsTable } from '@/modules/account/components/TradingPost/MarketResultsTable';
import { CommonMaterialsWatchlist } from '@/modules/account/components/TradingPost/CommonMaterialsWatchlist';
import { marketSync, CompactItem } from '@/modules/account/services/marketSync';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

export default function MarketAnalysisPage() {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [, setTick] = useState(0); // Zorunlu re-render için

  // 1. Initialize Autonomous Engine (Non-Blocking Swift Mode)
  useEffect(() => {
    marketSync.initIndex();
    setIsReady(true);

    // Arka planda veri indikçe listeyi güncelle (Her 2 saniyede bir)
    const interval = setInterval(() => {
      if (marketSync.isBusy()) {
        setTick(t => t + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Step 2: Determine Display Items (Global Market Logic)
  const getDisplayItems = (): CompactItem[] => {
    if (!isReady) return [];

    // Global Search
    if (searchQuery.length > 1) {
      return marketSync.search(searchQuery, 'All');
    }

    // Global Overview (All live items)
    return marketSync.getCategoryItems('All');
  };

  const filteredItems = getDisplayItems();

  const handleSelectItem = (id: number) => {
    setSelectedItemId(id);
    setTimeout(() => {
      document.getElementById('analysis-terminal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8 flex flex-col gap-10">
      {/* Top Section: Quick Watchlist */}
      <div className="w-full">
        <CommonMaterialsWatchlist onSelect={handleSelectItem} />
      </div>

      {/* Main Terminal Section */}
      <main className="flex flex-col gap-8 bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-10">

        {/* Search Bar (Clean Global Mode) */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="w-full">
              <MarketSearch
                onSelect={handleSelectItem}
                onQueryChange={(q) => setSearchQuery(q)}
              />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="min-h-[600px]">
          <MarketResultsTable
            items={filteredItems}
            onSelect={handleSelectItem}
            isLoading={!isReady}
          />
        </div>

      </main>

      {/* Analysis Section */}
      {selectedItemId && (
        <section id="analysis-terminal" className="mt-10 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/5 rounded-xl">
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Deep Market Analysis</h3>
          </div>
          <MarketAnalysisTerminal itemId={selectedItemId} />
        </section>
      )}

      {/* Quick Footer Info */}
      <footer className="mt-20 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
        <span className="text-[10px] font-black uppercase tracking-widest">Guild Wars 2 Market Terminal &copy; 2026</span>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-widest">API Status: Operational</span>
          <span className="text-[10px] font-black uppercase tracking-widest italic">V4.3 Market Engine</span>
        </div>
      </footer>
    </div>
  );
}
