'use client';

import React from 'react';
import { 
  LayoutGrid, 
  Sword, 
  Shield, 
  ShoppingBag, 
  Box, 
  FlaskConical, 
  Gem, 
  Zap,
  Filter
} from 'lucide-react';

import { MarketCategory } from '../../services/marketSync';

interface MarketFiltersProps {
  activeCategory: MarketCategory;
  onCategoryChange: (category: MarketCategory) => void;
}

const CATEGORIES: { id: MarketCategory, label: string, icon: any }[] = [
  { id: 'All', label: 'Tümü', icon: LayoutGrid },
  { id: 'Weapon', label: 'Silahlar', icon: Sword },
  { id: 'Armor', label: 'Zırhlar', icon: Shield },
  { id: 'Bag', label: 'Çantalar', icon: ShoppingBag },
  { id: 'Material', label: 'Materyaller', icon: Box },
  { id: 'Consumable', label: 'Tüketilebilir', icon: FlaskConical },
  { id: 'Trinket', label: 'Takılar', icon: Gem },
  { id: 'Upgrade', label: 'Yükseltme', icon: Zap },
];

export function MarketFilters({ activeCategory, onCategoryChange }: MarketFiltersProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-wrap items-center gap-3 p-3 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`
                group relative flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 border
                ${isActive 
                  ? 'bg-orange-500 border-orange-400 shadow-[0_10px_30px_rgba(249,115,22,0.3)]' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                }
              `}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange-400'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                {cat.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
              )}
            </button>
          );
        })}

        <div className="h-8 w-px bg-white/5 mx-2" />

        <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-500 hover:text-white hover:border-white/20 transition-all group">
            <Filter className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-[10px] font-black uppercase tracking-widest">Gelişmiş Seçenekler</span>
        </button>
      </div>

      <div className="flex items-center gap-4 px-6 py-3 bg-orange-500/5 rounded-2xl border border-orange-500/10 inline-flex self-start">
        <span className="text-[9px] font-black text-orange-500/50 uppercase tracking-[0.3em]">Aktif Filtre:</span>
        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
          {CATEGORIES.find(c => c.id === activeCategory)?.label}
        </span>
      </div>
    </div>
  );
}
