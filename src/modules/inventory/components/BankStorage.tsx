'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBank, fetchItemDefinitions } from '../services/inventoryApi';
import { useAuth } from '@/core/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function BankStorage() {
  const { apiKey } = useAuth();
  
  const { data: bankItems, isLoading: loadingBank } = useQuery({
    queryKey: ['bank-storage', apiKey],
    queryFn: () => fetchBank(apiKey!),
    enabled: !!apiKey,
  });

  const uniqueItemIds = useMemo(() => {
    if (!bankItems) return [];
    // Bank array can contain nulls for empty slots
    const validItems = bankItems.filter(item => item !== null && item.id);
    return Array.from(new Set(validItems.map(item => item.id)));
  }, [bankItems]);

  const { data: itemDefs, isLoading: loadingDefs } = useQuery({
    queryKey: ['item-defs', uniqueItemIds],
    queryFn: () => fetchItemDefinitions(uniqueItemIds),
    enabled: uniqueItemIds.length > 0,
  });

  if (!apiKey) return null;

  if (loadingBank || loadingDefs) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#eb5e28]" />
      </div>
    );
  }

  return (
    <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6">
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
        {bankItems?.map((item, index) => {
          if (!item) {
            return (
              <div key={`empty-${index}`} className="group relative flex flex-col items-center justify-center p-1 rounded bg-[#111] border border-[#2a2a2a] h-14 w-14">
              </div>
            );
          }

          const def = itemDefs?.find(d => d.id === item.id);
          const icon = def?.icon || '';
          const name = def?.name || `Item ${item.id}`;

          return (
            <div 
              key={`${item.id}-${index}`} 
              className="group relative flex flex-col items-center justify-center p-1 rounded bg-[#111] border border-[#333] hover:border-[#eb5e28]/50 transition-colors cursor-pointer h-14 w-14"
              title={name}
            >
              <div className="relative w-10 h-10">
                {icon ? (
                  <img src={icon} alt={name} className="w-full h-full object-cover rounded shadow-lg" />
                ) : (
                  <div className="w-full h-full rounded bg-gray-800" />
                )}
                {item.count > 1 && (
                  <span className="absolute -bottom-2 -right-2 bg-black/90 text-white text-[10px] font-mono px-1 rounded border border-[#333]">
                    {item.count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
