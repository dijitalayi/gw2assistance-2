'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCharacters, fetchProfessions, fetchSpecializations } from '../services/accountApi';
import { useAuth } from '@/core/contexts/AuthContext';
import { Loader2, Skull, Clock, Target, Shield } from 'lucide-react';

import Link from 'next/link';

function GuildNameDisplay({ guildId }: { guildId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['guild', guildId],
    queryFn: async () => {
      const res = await fetch(`https://api.guildwars2.com/v2/guild/${guildId}`);
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) return <span className="animate-pulse opacity-50">Fetching guild...</span>;
  if (!data) return <span>Unknown Guild</span>;
  return <span>[{data.tag}] {data.name}</span>;
}

const PROFESSION_ICONS: Record<string, string> = {
  Elementalist: 'https://wiki.guildwars2.com/images/c/c0/Elementalist_icon_%28highres%29.png',
  Mesmer: 'https://wiki.guildwars2.com/images/0/0a/Mesmer_icon_%28highres%29.png',
  Necromancer: 'https://wiki.guildwars2.com/images/2/27/Necromancer_icon_%28highres%29.png',
  Engineer: 'https://wiki.guildwars2.com/images/5/53/Engineer_icon_%28highres%29.png',
  Ranger: 'https://wiki.guildwars2.com/images/c/c7/Ranger_icon_%28highres%29.png',
  Thief: 'https://wiki.guildwars2.com/images/3/31/Thief_icon_%28highres%29.png',
  Guardian: 'https://wiki.guildwars2.com/images/3/30/Guardian_icon_%28highres%29.png',
  Revenant: 'https://wiki.guildwars2.com/images/2/2d/Revenant_icon_%28highres%29.png',
  Warrior: 'https://wiki.guildwars2.com/images/7/76/Warrior_icon_%28highres%29.png',
};

export function CharactersList() {
  const { apiKey } = useAuth();

  const { data: characters, isLoading, isError } = useQuery({
    queryKey: ['characters', apiKey],
    queryFn: () => fetchCharacters(apiKey!),
    enabled: !!apiKey,
  });

  const { data: professions } = useQuery({
    queryKey: ['professions'],
    queryFn: fetchProfessions,
    staleTime: 1000 * 60 * 60,
  });

  const { data: specializations } = useQuery({
    queryKey: ['specializations'],
    queryFn: fetchSpecializations,
    staleTime: 1000 * 60 * 60,
  });

  if (!apiKey) return null;

  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#eb5e28]" />
      </div>
    );
  }

  if (isError || !characters) {
    return <div className="text-red-500">Characters could not be loaded. Please check your API Key permissions.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {characters.map((char) => {
        // Resolve Elite Specialization
        let displaySpecName = char.profession;
        let displayIcon = '';

        // Safely check 3rd slot of PvE specializations
        const eliteSpecId = char.specializations?.pve?.[2]?.id;
        let eliteSpec = null;

        if (eliteSpecId && specializations) {
          eliteSpec = specializations.find(s => s.id === eliteSpecId);
          if (eliteSpec && eliteSpec.elite) {
            displaySpecName = eliteSpec.name;
            // Use MediaWiki's Special:FilePath to bypass complex MD5 URL formats!
            displayIcon = `https://wiki.guildwars2.com/wiki/Special:FilePath/${encodeURIComponent(eliteSpec.name + '_icon_(highres).png')}`;
          }
        }

        // Fallback to core profession if no elite spec found
        if (!displayIcon) {
          displayIcon = PROFESSION_ICONS[char.profession] || '';
          displaySpecName = char.profession;
        }

        return (
          <Link
            key={char.name}
            href={`/account/characters/${encodeURIComponent(char.name)}`}
            className="group flex flex-col bg-[#161616] border border-[#2a2a2a] rounded-md overflow-hidden transition-all duration-300 "
          >
            {/* Header Card */}
            <div className="p-5 border-b border-[#2a2a2a] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-80 pointer-events-none">
                {displayIcon ? (
                  <img
                    src={displayIcon}
                    alt={displaySpecName}
                    className="w-24 h-24"
                  />
                ) : (
                  <div className="text-6xl font-black">{char.level}</div>
                )}
              </div>
              <div className="relative z-10 flex flex-col">
                <h3 className="font-outfit text-xl font-semibold text-gray-100 mb-1 group-hover:text-[#eb5e28] transition-colors">{char.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-[#2a2a2a] text-gray-300 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Lvl {char.level}</span>
                  <span className="text-xs text-[#eb5e28] font-bold uppercase tracking-wider">{char.gender} {char.race}</span>
                </div>
                <p className="text-sm text-gray-400 border-l-2 border-[#eb5e28] pl-2 flex items-center gap-2">
                  {displaySpecName}
                </p>
              </div>
            </div>

            {/* Body Stats */}
            <div className="p-5 flex flex-col gap-4 bg-[#111] flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center group-hover:border-[#eb5e28]/30 transition-colors">
                    <Skull className="w-4 h-4 text-red-500/70" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Deaths</span>
                    <span className="text-sm font-mono text-gray-200">{char.deaths.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center group-hover:border-[#eb5e28]/30 transition-colors">
                    <Clock className="w-4 h-4 text-[#eb5e28]/70" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Playtime</span>
                    <span className="text-sm font-mono text-gray-200">{Math.floor(char.age / 3600).toLocaleString()}h</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex items-center gap-2 mt-auto">
                <Target className="w-4 h-4 text-[#eb5e28]" />
                <span className="text-xs text-gray-400 font-mono">
                  {char.guild ? <GuildNameDisplay guildId={char.guild} /> : "No Guild"}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
