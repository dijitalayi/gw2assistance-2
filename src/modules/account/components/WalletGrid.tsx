'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWallet, fetchCurrenciesInfo, CurrencyValue, CurrencyDef } from '../services/accountApi';
import { useAuth } from '@/core/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function WalletGrid() {
  const { apiKey } = useAuth();
  const [mergedWallet, setMergedWallet] = useState<(CurrencyValue & CurrencyDef)[]>([]);

  const { data: walletData, isLoading: loadingWallet } = useQuery({
    queryKey: ['wallet', apiKey],
    queryFn: () => fetchWallet(apiKey!),
    enabled: !!apiKey,
  });

  const currencyIds = walletData?.map(w => w.id) || [];

  const { data: currenciesDef, isLoading: loadingDefs } = useQuery({
    queryKey: ['currencies', currencyIds],
    queryFn: () => fetchCurrenciesInfo(currencyIds),
    enabled: currencyIds.length > 0,
  });

  useEffect(() => {
    if (walletData && currenciesDef) {
      const merged = walletData.map(w => {
        const def = currenciesDef.find(c => c.id === w.id);
        return {
          ...w,
          ...def,
          // Fallbacks if def not found
          name: def?.name || `Currency ${w.id}`,
          order: def?.order || 999,
          description: def?.description || '',
          icon: def?.icon || ''
        };
      });
      merged.sort((a, b) => a.order - b.order);
      setMergedWallet(merged);
    }
  }, [walletData, currenciesDef]);

  if (!apiKey) return null;

  if (loadingWallet || loadingDefs) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#eb5e28]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {mergedWallet.map((item) => (
        <div key={item.id} className="bg-[#121212]/80 backdrop-blur-md rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:border-[#eb5e28]/40 transition-colors shadow-black/40 shadow-lg">
          {item.icon ? (
            <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
          ) : (
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">?</div>
          )}
          <div className="flex flex-col">
            <span className="font-outfit font-bold text-gray-200 text-sm leading-tight mb-1">{item.name}</span>
            <span className="font-mono text-[#eb5e28] text-lg font-black leading-none">
              {item.value.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
