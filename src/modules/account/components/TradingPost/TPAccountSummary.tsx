'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/core/contexts/AuthContext';
import { fetchCommerceDelivery, COMMERCE_ASSETS } from '../../services/commerceApi';
import { Loader2, Package, Inbox, AlertCircle } from 'lucide-react';
import { PriceDisplay } from '@/shared/components/PriceDisplay';

export function TPAccountSummary() {
  const { apiKey } = useAuth();
  
  const { data: delivery, isLoading, error } = useQuery({
    queryKey: ['tp-delivery', apiKey],
    queryFn: () => fetchCommerceDelivery(apiKey!),
    enabled: !!apiKey,
    refetchInterval: 120000 // 2 dakikada bir kontrol
  });

  if (isLoading) {
    return (
      <div className="h-full bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing TP Account...</span>
      </div>
    );
  }

  // Yetki hatası (401) veya genel hata durumunda kullanıcıyı bilgilendir
  if (error || !delivery) {
    return (
      <div className="bg-orange-500/5 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-6 flex flex-col gap-2 shadow-2xl">
        <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-200">Auth Required</h3>
        </div>
        <p className="text-[9px] text-gray-500 font-bold leading-relaxed uppercase tracking-widest">
            Please check your API Key scopes or connection. Trading Post data is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1c23]/80 to-[#13151a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-orange-500 opacity-5 blur-2xl rounded-full" />
      
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Pending Delivery</h3>
        </div>
        <div className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <span className="text-[8px] font-black text-orange-500 uppercase tracking-tighter">Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 z-10">
        <div className="flex flex-col gap-1 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Available Gold</span>
            <PriceDisplay coins={delivery?.coins || 0} size="md" />
        </div>
        <div className="flex flex-col gap-1 p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Pending Items</span>
            <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">{delivery?.items?.length || 0}</span>
                <Package className="w-4 h-4 text-gray-600" />
            </div>
        </div>
      </div>

      {delivery?.items?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 z-10">
            {delivery.items.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="w-8 h-8 bg-black/40 rounded-lg border border-white/5 flex items-center justify-center p-1 group/item relative">
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black px-1 rounded-full border border-black z-20">
                        {item.count}
                    </div>
                    <img src={`https://render.guildwars2.com/file/${item.id}.png`} className="w-full h-full object-contain grayscale group-hover/item:grayscale-0 transition-all" alt="" />
                </div>
            ))}
            {delivery.items.length > 5 && (
                <div className="w-8 h-8 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-[8px] font-black text-gray-500 italic">
                    +{delivery.items.length - 5}
                </div>
            )}
        </div>
      )}
    </div>
  );
}
