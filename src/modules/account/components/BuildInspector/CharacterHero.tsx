'use client';

import React from 'react';
import { Skull, Clock, Shield, Target, Star } from 'lucide-react';

interface CharacterHeroProps {
  name: string;
  level: number;
  race: string;
  gender: string;
  profession: string;
  deaths: number;
  age: number;
  eliteSpecName?: string;
  eliteSpecIcon?: string;
  guildTag?: string;
  titleName?: string;
}

export function CharacterHero({
  name, level, race, gender, profession, deaths, age,
  eliteSpecName, eliteSpecIcon, guildTag, titleName
}: CharacterHeroProps) {
  const displaySpec = eliteSpecName || profession;
  const professionIcon = eliteSpecIcon || `https://wiki.guildwars2.com/wiki/Special:FilePath/${encodeURIComponent(profession + '_icon_(highres).png')}`;
  const playHours = Math.floor(age / 3600);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#2a2a2a] mb-6">
      {/* Arka plan gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c23] via-[#161616] to-[#0d0d0d]" />

      {/* Profession watermark */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center opacity-10 pointer-events-none overflow-hidden">
        <img
          src={professionIcon}
          alt={displaySpec}
          className="h-64 w-64 object-contain"
        />
      </div>

      {/* Aksan çizgisi */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#eb5e28] to-transparent" />

      {/* İçerik */}
      <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Büyük ikon */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
            <img
              src={professionIcon}
              alt={displaySpec}
              className="w-16 h-16 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Metin bilgileri */}
        <div className="flex-1">
          {titleName && (
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">{titleName}</span>
            </div>
          )}

          <h1 className="text-3xl font-outfit font-black text-white mb-1 drop-shadow-md">{name}</h1>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-bold text-[#eb5e28] uppercase tracking-wider">{displaySpec}</span>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-400">{gender} {race}</span>
            {guildTag && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-xs bg-[#2a2a2a] border border-[#3a3a3a] text-gray-300 px-2 py-0.5 rounded font-mono">{guildTag}</span>
              </>
            )}
          </div>

          {/* İstatistik rozetleri */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
              <Skull className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-gray-400">Deaths</span>
              <span className="text-xs font-bold font-mono text-white">{deaths.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 text-[#eb5e28]" />
              <span className="text-xs text-gray-400">Play Time</span>
              <span className="text-xs font-bold font-mono text-white">{playHours.toLocaleString()}h</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-gray-400">Level</span>
              <span className="text-xs font-bold font-mono text-white">{level}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
