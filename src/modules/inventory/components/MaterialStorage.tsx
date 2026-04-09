'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMaterialCategories, fetchMaterialStorage, fetchItemDefinitions } from '../services/inventoryApi';
import { useAuth } from '@/core/contexts/AuthContext';
import { Loader2, Search } from 'lucide-react';

export function MaterialStorage() {
  const { apiKey } = useAuth();
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: loadingCat } = useQuery({
    queryKey: ['material-categories'],
    queryFn: fetchMaterialCategories,
  });

  const { data: storage, isLoading: loadingStorage } = useQuery({
    queryKey: ['material-storage', apiKey],
    queryFn: () => fetchMaterialStorage(apiKey!),
    enabled: !!apiKey,
  });

  // Extract unique item IDs that user actually has to fetch their icons
  const itemIds = useMemo(() => {
    if (!storage) return [];
    return storage.filter(s => s.count > 0).map(s => s.id);
  }, [storage]);

  // Fetch definitions in chunks if possible, or all together if small enough
  const { data: itemDefs, isLoading: loadingDefs } = useQuery({
    queryKey: ['item-defs', itemIds],
    queryFn: () => fetchItemDefinitions(itemIds),
    enabled: itemIds.length > 0,
  });

  // Set default tab once categories load
  useEffect(() => {
    if (categories && categories.length > 0 && activeTab === null) {
      setActiveTab(categories.sort((a, b) => a.order - b.order)[0].id);
    }
  }, [categories, activeTab]);

  if (!apiKey) return null;

  if (loadingCat || loadingStorage || loadingDefs) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#eb5e28]" />
      </div>
    );
  }

  const mergedItems = storage?.filter(s => s.count > 0).map(s => {
    const def = itemDefs?.find(d => d.id === s.id);
    return {
      ...s,
      name: def?.name || `Item ${s.id}`,
      icon: def?.icon || '',
      rarity: def?.rarity || 'Basic'
    };
  }) || [];

  const filteredItems = mergedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    // If user is searching, ignore the tab boundary to find the item globally
    const matchesTab = searchQuery ? true : item.category === activeTab;
    return matchesTab && matchesSearch;
  });

  const orderedCategories = categories?.sort((a, b) => a.order - b.order) || [];

  return (
    <div className="flex flex-col gap-6">

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#161616] p-4 rounded-xl border border-[#2a2a2a] gap-4">

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Material Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-[#333] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#eb5e28] transition-colors"
          />
        </div>

        <div className="text-sm font-mono text-gray-400">
          Showing <span className="text-[#eb5e28] font-bold">{filteredItems.length}</span> items
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2a2a2a] pb-4">
        {orderedCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-bold shadow-sm border ${activeTab === cat.id
                ? 'bg-[#eb5e28] text-white border-[#eb5e28] shadow-[0_0_10px_rgba(235,94,40,0.4)]'
                : 'bg-[#161616] border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#495057] hover:bg-[#212529]'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Bu kategoride veya aramada malzeme bulunamadı.</div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="group relative flex flex-col items-center justify-center p-2 rounded bg-[#111] border border-[#333] hover:border-[#eb5e28]/50 transition-colors cursor-pointer"
                title={item.name}
              >
                <div className="relative w-12 h-12">
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} className="w-full h-full object-cover rounded shadow-lg" />
                  ) : (
                    <div className="w-full h-full rounded bg-gray-800" />
                  )}
                  <span className="absolute -bottom-2 -right-2 bg-black/80 text-white text-[10px] font-mono px-1 rounded border border-[#333]">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
