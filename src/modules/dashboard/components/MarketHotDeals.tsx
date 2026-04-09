'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCommercePrices, calculateProfit, fetchItemDetails, getRarityColor } from '@/modules/account/services/commerceApi';
import { PriceDisplay } from '@/shared/components/PriceDisplay';
import { Loader2, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { marketSync } from '@/modules/account/services/marketSync';

export function MarketHotDeals() {
  // Pazarın en çok işlem gören, yüksek likiditeli demirbaş eşyaları
  const hotIds = [19684, 19721, 24295, 24358, 24351, 19701, 70842, 19748, 74326, 46738];

  const { data: prices, isLoading: loadingPrices } = useQuery({
    queryKey: ['dashboard-hot-deals-prices'],
    queryFn: () => fetchCommercePrices(hotIds),
    refetchInterval: 60000
  });

  const { data: itemDetails } = useQuery({
    queryKey: ['dashboard-hot-deals-details', hotIds],
    queryFn: async () => {
        const results = await Promise.all(hotIds.map(id => fetchItemDetails(id)));
        return results;
    },
    staleTime: 3600000
  });

  const deals = useMemo(() => {
    if (!prices || !itemDetails) return [];

    const calculated = prices.map(p => {
        const detail = itemDetails.find(d => d.id === p.id);
        const profitData = calculateProfit(p.buys.unit_price, p.sells.unit_price);
        return {
            id: p.id,
            name: detail?.name || `Item ${p.id}`,
            rarity: detail?.rarity,
            icon: detail?.icon,
            sellPrice: p.sells.unit_price,
            roi: profitData.roi,
            profit: profitData.profit
        };
    });

    // Filtreleme yapmadan, sabit listedeki en popüler 5 eşyayı getir
    return calculated.slice(0, 5);
  }, [prices, itemDetails]);

  if (loadingPrices) {
    return (
      <div className="bg-[#111318]/40 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#eb5e28]/20" />
        <span className="text-[10px] font-black uppercase text-gray-700 tracking-[0.3em]">Scanning Market Opportunities...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#111318]/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl h-full">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#eb5e28]/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-[#eb5e28]" />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Market Pulse</h3>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
            <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Volume Leaders</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {deals.length > 0 ? (
            deals.map((deal) => (
                <div key={deal.id} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.05] hover:border-[#eb5e28]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 p-1.5 overflow-hidden group-hover:scale-110 transition-transform">
                            {deal.icon && <img src={deal.icon} alt="" className="w-full h-full object-contain" />}
                        </div>
                        <div className="flex flex-col">
                            <span 
                                className="text-[11px] font-black uppercase tracking-tight truncate max-w-[120px]"
                                style={{ color: getRarityColor(deal.rarity) }}
                            >
                                {deal.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-emerald-500 italic">+{deal.roi.toFixed(1)}% ROI</span>
                                <ArrowUpRight className="w-3 h-3 text-emerald-500 opacity-40" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <PriceDisplay coins={deal.sellPrice} size="sm" />
                        <span className="text-[8px] font-black text-gray-600 uppercase mt-1">Market Price</span>
                    </div>
                </div>
            ))
        ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-30">
                <Zap className="w-6 h-6 text-gray-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">No high-margin deals found<br />in current cycle</span>
            </div>
        )}
      </div>
    </div>
  );
}
