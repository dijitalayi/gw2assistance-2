'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGemsToGoldExchange, fetchGoldToGemsExchange, COMMERCE_ASSETS } from '../../services/commerceApi';
import { Loader2, RefreshCw, ArrowRightLeft, TrendingUp, Wallet } from 'lucide-react';
import { PriceDisplay } from '@/shared/components/PriceDisplay';

export function ExchangeRates() {
  const { data: gemsToGold, isLoading: loadingGems, refetch: refetchGems } = useQuery({
    queryKey: ['exchange-gems'],
    queryFn: () => fetchGemsToGoldExchange(100),
    refetchInterval: 60000 
  });

  const { data: goldToGems, isLoading: loadingGold, refetch: refetchGold } = useQuery({
    queryKey: ['exchange-gold'],
    queryFn: () => fetchGoldToGemsExchange(100), // 100 gold search
    refetchInterval: 60000
  });

  const isLoading = loadingGems || loadingGold;

  if (isLoading) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[180px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500/50" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Parite Hesaplanıyor...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Gems to Gold Card */}
      <div className="bg-[#13151a]/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
          <ArrowRightLeft className="w-24 h-24 text-cyan-400 rotate-12" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80">Likidite: Yüksek</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-white tracking-tighter">100</span>
                    <img src={COMMERCE_ASSETS.GEMS} className="w-7 h-7 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" alt="Gems" />
                </div>
            </div>
            <button onClick={() => refetchGems()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group/btn border border-white/5">
                <RefreshCw className="w-4 h-4 text-gray-500 group-hover/btn:text-cyan-400 group-hover/btn:rotate-180 transition-all duration-500" />
            </button>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Dönüşüm Getirisi (Altın)</span>
            <div className="p-3 bg-black/40 rounded-2xl border border-white/5 inline-flex items-center hover:border-cyan-500/20 transition-colors">
                <PriceDisplay coins={gemsToGold?.coins_per_gem ? gemsToGold.coins_per_gem * 100 : 0} size="lg" />
            </div>
        </div>
      </div>

      {/* Gold to Gems Card */}
      <div className="bg-[#13151a]/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 relative overflow-hidden group hover:border-[#eb5e28]/30 transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
          <Wallet className="w-24 h-24 text-[#eb5e28] -rotate-12" />
        </div>

        <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-[#eb5e28]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#eb5e28]/80">Makas Oranı: ~%22</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-white tracking-tighter">100</span>
                    <img src={COMMERCE_ASSETS.GOLD} className="w-7 h-7 drop-shadow-[0_0_10px_rgba(235,94,40,0.6)]" alt="Gold" />
                </div>
            </div>
            <button onClick={() => refetchGold()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group/btn border border-white/5">
                <RefreshCw className="w-4 h-4 text-gray-500 group-hover/btn:text-[#eb5e28] group-hover/btn:rotate-180 transition-all duration-500" />
            </button>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Alınacak Gem (Mücevher)</span>
            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/5 inline-flex">
                <span className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {goldToGems?.quantity || 0}
                </span>
                <img src={COMMERCE_ASSETS.GEMS} className="w-6 h-6" alt="Gems" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter ml-auto">+ANINDA</span>
            </div>
        </div>
      </div>
    </div>
  );
}
