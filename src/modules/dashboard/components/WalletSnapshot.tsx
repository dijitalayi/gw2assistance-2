'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWallet } from '@/modules/account/services/accountApi';
import { useAuth } from '@/core/contexts/AuthContext';
import { PriceDisplay } from '@/shared/components/PriceDisplay';
import { Loader2, Wallet, Coins, Star, Sparkles } from 'lucide-react';

export function WalletSnapshot() {
  const { apiKey } = useAuth();
  
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['account-wallet'],
    queryFn: () => fetchWallet(apiKey!),
    enabled: !!apiKey,
    refetchInterval: 60000 // Her dakika güncelle
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 bg-[#212529] border border-[#343a40] rounded-2xl px-6 py-3">
        <Loader2 className="w-4 h-4 animate-spin text-[#eb5e28]" />
        <span className="text-[10px] font-black uppercase text-[#6c757d] tracking-widest">Fetching Wallet Assets...</span>
      </div>
    );
  }

  const getCurrency = (id: number) => wallet?.find(c => c.id === id)?.value || 0;

  const gold = getCurrency(1);
  const karma = getCurrency(3);
  const gems = getCurrency(4);

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-6">
      {/* Gold Widget */}
      <div className="flex items-center gap-4 bg-[#212529] border border-[#343a40] rounded-2xl px-5 py-2.5 hover:border-[#eb5e28]/50 transition-all group shadow-lg">
        <div className="p-2 bg-[#343a40] rounded-xl group-hover:bg-[#eb5e28]/10 transition-colors">
          <img src="https://render.guildwars2.com/file/090A980A96D39FD36FBB004903644C6DBEFB1FFB/156904.png" alt="Gold" className="w-5 h-5 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-[#6c757d] uppercase tracking-widest leading-none mb-1">Liquid Gold</span>
          <PriceDisplay coins={gold} size="sm" />
        </div>
      </div>

      {/* Gems Widget */}
      <div className="flex items-center gap-4 bg-[#212529] border border-[#343a40] rounded-2xl px-5 py-2.5 hover:border-[#eb5e28]/50 transition-all group shadow-lg">
        <div className="p-2 bg-[#343a40] rounded-xl group-hover:bg-[#eb5e28]/10 transition-colors">
          <img src="https://render.guildwars2.com/file/086CF7BC17BC0106A4B15F61213EDB68A2A874AB/502064.png" alt="Gems" className="w-5 h-5 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-[#6c757d] uppercase tracking-widest leading-none mb-1">Store Gems</span>
          <div className="text-sm font-black text-[#f8f9fa] italic tracking-tighter">
            {gems.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Karma Widget */}
      <div className="flex items-center gap-4 bg-[#212529] border border-[#343a40] rounded-2xl px-5 py-2.5 hover:border-[#eb5e28]/50 transition-all group shadow-lg">
        <div className="p-2 bg-[#343a40] rounded-xl group-hover:bg-[#eb5e28]/10 transition-colors">
          <img src="https://wiki.guildwars2.com/images/4/44/Karma_Gain.png" alt="Karma" className="w-5 h-5 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-[#6c757d] uppercase tracking-widest leading-none mb-1">Account Karma</span>
          <div className="text-sm font-black text-[#ced4da] italic tracking-tighter">
            {karma.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
