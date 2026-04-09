'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCharacterBags, fetchItemDefinitions } from '../services/inventoryApi';
import { fetchCharacters } from '@/modules/account/services/accountApi';
import { useAuth } from '@/core/contexts/AuthContext';
import { Loader2, Users } from 'lucide-react';

export function CharacterBags() {
  const { apiKey } = useAuth();
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  const { data: characters, isLoading: loadingChars } = useQuery({
    queryKey: ['characters', apiKey],
    queryFn: () => fetchCharacters(apiKey!),
    enabled: !!apiKey,
  });

  useEffect(() => {
    if (characters && characters.length > 0 && !selectedChar) {
      setSelectedChar(characters[0].name);
    }
  }, [characters, selectedChar]);

  const { data: characterData, isLoading: loadingBags } = useQuery({
    queryKey: ['character-bags', apiKey, selectedChar],
    queryFn: () => fetchCharacterBags(apiKey!, selectedChar!),
    enabled: !!apiKey && !!selectedChar,
  });

  const uniqueItemIds = useMemo(() => {
    if (!characterData?.bags) return [];
    const ids = new Set<number>();
    characterData.bags.forEach(bag => {
      if (bag && bag.inventory) {
        bag.inventory.forEach(item => {
          if (item && item.id) ids.add(item.id);
        });
      }
    });
    return Array.from(ids);
  }, [characterData]);

  const { data: itemDefs, isLoading: loadingDefs } = useQuery({
    queryKey: ['item-defs', uniqueItemIds],
    queryFn: () => fetchItemDefinitions(uniqueItemIds),
    enabled: uniqueItemIds.length > 0,
  });

  if (!apiKey) return null;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Character Selector */}
      <div className="flex flex-col md:flex-row items-center bg-[#161616] p-4 rounded-xl border border-[#2a2a2a] gap-4">
        <Users className="w-5 h-5 text-gray-500" />
        <select 
          value={selectedChar || ''} 
          onChange={(e) => setSelectedChar(e.target.value)}
          className="bg-[#111] border border-[#333] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#eb5e28] transition-colors"
          disabled={loadingChars}
        >
          {characters?.map(char => (
            <option key={char.name} value={char.name}>{char.name}</option>
          ))}
        </select>
        
        {(loadingChars || loadingBags || loadingDefs) && (
          <Loader2 className="w-5 h-5 animate-spin text-[#eb5e28] ml-auto" />
        )}
      </div>

      {/* Bags Grid */}
      {characterData?.bags && characterData.bags.length > 0 && (
        <div className="flex flex-col gap-4">
          {characterData.bags.map((bag, bagIndex) => {
            if (!bag) return null;

            return (
              <div key={`bag-${bagIndex}`} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
                <div className="text-gray-400 font-bold mb-3 text-sm flex justify-between">
                  <span>Bag {bagIndex + 1} ({bag.size} Slots)</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {bag.inventory.map((item, itemIndex) => {
                    if (!item) {
                      return (
                        <div key={`empty-${bagIndex}-${itemIndex}`} className="group relative flex flex-col items-center justify-center p-1 rounded bg-[#111] border border-[#2a2a2a] h-14 w-14">
                        </div>
                      );
                    }

                    const def = itemDefs?.find(d => d.id === item.id);
                    const icon = def?.icon || '';
                    const name = def?.name || `Item ${item.id}`;

                    return (
                      <div 
                        key={`${item.id}-${bagIndex}-${itemIndex}`} 
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
          })}
        </div>
      )}

    </div>
  );
}
