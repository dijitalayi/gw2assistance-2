'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  fetchCommercePrices, 
  fetchItemDetails,
  getRarityColor
} from '../../services/commerceApi';
import { marketSync } from '../../services/marketSync';
import { Loader2, TrendingUp, Activity, Zap } from 'lucide-react';
import { PriceDisplay } from '@/shared/components/PriceDisplay';

interface WatchlistProps {
  onSelect?: (id: number) => void;
}

// Smart Item Display: Name & Icon combined to avoid ID-only bugs
const WatchlistCard = ({ id, price, onClick }: { id: number; price: any; onClick: () => void }) => {
  const { data: item } = useQuery({
    queryKey: ['watchlist-item-details', id],
    queryFn: () => fetchItemDetails(id),
    staleTime: Infinity,
  });

  const name = item?.name || marketSync.getItemName(id);

  return (
    <button
      onClick={onClick}
      className="bg-[#111318]/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 group hover:border-orange-500/50 transition-all duration-500 hover:bg-white/[0.05] relative overflow-hidden text-left w-full h-full"
    >
      <div className="flex items-start justify-between z-10 relative">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-1.5 relative overflow-hidden group-hover:scale-110 transition-transform shadow-inner">
          {item?.icon ? (
            <img src={item.icon} alt="" className="w-full h-full object-contain relative z-10" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-white/5 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-orange-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex flex-col items-end">
          <TrendingUp className="w-3 h-3 text-emerald-500/20 group-hover:text-emerald-500 transition-colors" />
          {item?.rarity && (
            <span className="text-[7px] font-black uppercase opacity-20 group-hover:opacity-100 transition-opacity text-orange-500 mt-1">{item.rarity}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 z-10 relative">
        <span 
          className="text-[10px] font-black uppercase tracking-tight transition-colors truncate"
          style={{ color: getRarityColor(item?.rarity) }}
        >
          {name}
        </span>
        <div className="group-hover:scale-105 transition-transform origin-left">
          <PriceDisplay coins={price?.sells.unit_price || 0} size="sm" />
        </div>
      </div>

      {/* Decorative pulse element */}
      <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-orange-500/5 blur-2xl rounded-full group-hover:bg-orange-500/10 transition-all duration-700" />
      <Zap className="absolute top-2 right-2 w-10 h-10 text-white/[0.02] group-hover:text-orange-500/[0.05] transition-colors -rotate-12" />
    </button>
  );
};

export function CommonMaterialsWatchlist({ onSelect }: WatchlistProps) {
  // Global Tier1/Tier2 Market Movers
  const watchlistIds = [19684, 19721, 68063, 19701, 19722, 24295];

  const { data: prices, isLoading } = useQuery({
    queryKey: ['market-watchlist-v8.6'],
    queryFn: () => fetchCommercePrices(watchlistIds),
    refetchInterval: 60000
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-orange-500/50" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Global Pivot Watchlist</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest">Live Saturation</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {watchlistIds.map(id => (
          <div key={id}>
            <WatchlistCard
              id={id}
              price={prices?.find(p => p.id === id)}
              onClick={() => onSelect?.(id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
