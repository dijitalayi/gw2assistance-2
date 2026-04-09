'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchCommercePrices,
  fetchBatchListings,
  fetchBatchHistory,
  calculateProfit,
  calculateMarketMetrics,
  getRarityColor
} from '../../services/commerceApi';
import { PriceDisplay } from '@/shared/components/PriceDisplay';
import { Loader2, ArrowUpDown, ChevronUp, ChevronDown, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface MarketResultsTableProps {
  items: { id: number; name: string }[];
  onSelect: (id: number) => void;
  isLoading?: boolean;
}

type SortKey = 'name' | 'sell' | 'buy' | 'profit' | 'roi' | 'supply' | 'demand' | 'sold' | 'offers' | 'bought' | 'bids';

const ITEMS_PER_PAGE = 15;

export function MarketResultsTable({ items, onSelect, isLoading: isSearchLoading }: MarketResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' } | null>(null);

  // SDA (Super-Deep Analysis): Analyze top 500 results for perfect sorting matching gw2bltc
  const allIds = useMemo(() => items.map(i => i.id).slice(0, 500), [items]);

  const { data: allDetails } = useQuery({
    queryKey: ['market-sda-details-v8.6', allIds],
    queryFn: async () => {
      if (allIds.length === 0) return [];
      const chunks = [];
      for (let i = 0; i < allIds.length; i += 200) chunks.push(allIds.slice(i, i + 200));
      const results = await Promise.all(chunks.map(async chunk => {
        const res = await fetch(`https://api.guildwars2.com/v2/items?ids=${chunk.join(',')}`);
        return res.ok ? res.json() : [];
      }));
      return results.flat();
    },
    enabled: allIds.length > 0
  });

  const { data: allPrices, isLoading: loadingPrices } = useQuery({
    queryKey: ['market-sda-prices-v8.6', allIds],
    queryFn: async () => {
      const chunks = [];
      for (let i = 0; i < allIds.length; i += 200) chunks.push(allIds.slice(i, i + 200));
      const results = await Promise.all(chunks.map(chunk => fetchCommercePrices(chunk)));
      return results.flat();
    },
    enabled: allIds.length > 0
  });

  const { data: allListings } = useQuery({
    queryKey: ['market-sda-listings-v8.6', allIds],
    queryFn: async () => {
      // Only fetch top 100 listings for depth to save bandwidth, but sort by price mostly
      return fetchBatchListings(allIds.slice(0, 100));
    },
    enabled: allIds.length > 0
  });

  const { data: allHistory } = useQuery({
    queryKey: ['market-sda-history-v8.6', allIds],
    queryFn: () => fetchBatchHistory(allIds.slice(0, 100)),
    enabled: allIds.length > 0,
    staleTime: 300000
  });

  const fullData = useMemo(() => {
    return items.slice(0, 500).map(item => {
      const detail = allDetails?.find((d: any) => d.id === item.id);
      const p = allPrices?.find(pr => pr.id === item.id);
      const l = allListings?.find(li => li.id === item.id);
      const hist = allHistory?.[item.id];
      const profitData = p ? calculateProfit(p.buys.unit_price, p.sells.unit_price) : null;
      const metrics = l ? calculateMarketMetrics(l) : null;

      return {
        ...item,
        detail,
        sell: p?.sells.unit_price || 0,
        buy: p?.buys.unit_price || 0,
        profit: profitData?.profit || 0,
        roi: profitData?.roi || 0,
        supply: metrics?.supply || 0,
        demand: metrics?.demand || 0,
        sold: hist?.avg_sold || 0,
        bought: hist?.avg_bought || 0,
        offers: metrics?.offers || 0,
        bids: metrics?.bids || 0
      };
    });
  }, [items, allDetails, allPrices, allListings, allHistory]);

  const sortedData = useMemo(() => {
    // If no explicit sort, default to Buy price DESC (matching users latest screenshot)
    const config = sortConfig || { key: 'buy', direction: 'desc' };

    return [...fullData].sort((a, b) => {
      const aVal = (a as any)[config.key];
      const bVal = (b as any)[config.key];
      if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [fullData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  const isLoading = isSearchLoading || (allIds.length > 0 && loadingPrices);

  if (isLoading) {
    return (
      <div className="bg-black/40 border border-white/5 rounded-2xl p-32 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500/50" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">SDA ENGINE: CALIBRATING 500+ MARKET DATA POINTS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2 hover:bg-white/5 disabled:opacity-20" disabled={currentPage === 1}><ChevronLeft className="w-4 h-4 text-orange-500" /></button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(10, totalPages))].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-white/5'}`}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-2 hover:bg-white/5 disabled:opacity-20" disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4 text-orange-500" /></button>
        </div>
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] text-right">
          SDA VIEW • {sortedData.length} ASSETS • PG {currentPage}
        </span>
      </div>

      <div className="bg-[#111318]/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                {[
                  { key: 'name', label: 'Name' }, { key: 'sell', label: 'Sell' }, { key: 'buy', label: 'Buy' },
                  { key: 'profit', label: 'Profit' }, { key: 'roi', label: 'ROI' }, { key: 'supply', label: 'Supply' },
                  { key: 'demand', label: 'Demand' }, { key: 'sold', label: 'Sold (Avg)' }, { key: 'offers', label: 'Offers' },
                  { key: 'bought', label: 'Bought (Avg)' }, { key: 'bids', label: 'Bids' }
                ].map((col) => (
                  <th key={col.key} onClick={() => {
                    let dir: 'asc' | 'desc' = 'desc';
                    if (sortConfig?.key === col.key && sortConfig.direction === 'desc') dir = 'asc';
                    setSortConfig({ key: col.key as SortKey, direction: dir });
                  }} className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-500 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-1">{col.label} {sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />) : <ArrowUpDown className="w-2 h-2 opacity-10" />}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {paginatedItems.map((item) => (
                <tr key={item.id} onClick={() => onSelect(item.id)} className="group hover:bg-orange-500/[0.03] transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-orange-500">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 p-1 flex items-center justify-center">
                        {item.detail?.icon && <img src={item.detail.icon} className="w-full h-full object-contain" alt="" />}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span 
                            className="mb-0.5 text-[11px] font-black uppercase transition-colors leading-none"
                            style={{ color: getRarityColor(item.detail?.rarity) }}
                          >
                            {item.detail?.name || item.name}
                          </span>
                          <a href={`https://wiki.guildwars2.com/wiki/${item.id}`} target="_blank" className="text-gray-700 hover:text-orange-500"><ExternalLink className="w-3 h-3" /></a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3"><PriceDisplay coins={item.sell} size="sm" /></td>
                  <td className="p-3"><PriceDisplay coins={item.buy} size="sm" /></td>
                  <td className="p-3"><div className={item.profit >= 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}><PriceDisplay coins={item.profit} size="sm" /></div></td>
                  <td className="p-3 font-mono text-[10px]"><span className={item.roi >= 15 ? "text-emerald-400 font-bold" : "text-orange-400 font-bold"}>{item.roi.toFixed(1)}%</span></td>
                  <td className="p-3 text-[10px] font-mono text-gray-400">{item.supply.toLocaleString('en-US')}</td>
                  <td className="p-3 text-[10px] font-mono text-cyan-500/50">{item.demand.toLocaleString('en-US')}</td>
                  <td className="p-3 text-[10px] font-mono text-emerald-500/80">{item.sold.toLocaleString('en-US')}</td>
                  <td className="p-3 text-[10px] font-mono text-gray-600">{item.offers.toLocaleString('en-US')}</td>
                  <td className="p-3 text-[10px] font-mono text-orange-500/80">{item.bought.toLocaleString('en-US')}</td>
                  <td className="p-3 text-[10px] font-mono text-gray-600">{item.bids.toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
