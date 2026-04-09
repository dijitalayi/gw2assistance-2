'use client';

import React from 'react';
import {
  Swords,
  Shield,
  Heart,
  Target,
  Zap,
  Droplets,
  Activity,
  Clock,
  Maximize,
  Award,
  Star,
  Trophy
} from 'lucide-react';

export interface CharacterStats {
  Power?: number;
  Precision?: number;
  Toughness?: number;
  Vitality?: number;
  Ferocity?: number;
  'Healing Power'?: number;
  'Condition Damage'?: number;
  Expertise?: number;
  Concentration?: number;
  'Agony Resistance'?: number;
  'Critical Chance'?: number;
  'Critical Damage'?: number;
  [key: string]: number | undefined;
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  Power: <Swords className="w-4 h-4" />,
  Precision: <Target className="w-4 h-4" />,
  Toughness: <Shield className="w-4 h-4" />,
  Vitality: <Heart className="w-4 h-4" />,
  Ferocity: <Zap className="w-4 h-4" />,
  'Healing Power': <Droplets className="w-4 h-4" />,
  'Condition Damage': <Activity className="w-4 h-4" />,
  'Condition Duration': <Clock className="w-4 h-4" />,
  Expertise: <Clock className="w-4 h-4" />,
  Concentration: <Clock className="w-4 h-4" />,
  'Boon Duration': <Clock className="w-4 h-4" />,
  'Critical Chance': <Target className="w-4 h-4" />,
  'Critical Damage': <Zap className="w-4 h-4" />,
  'Agony Resistance': <Maximize className="w-4 h-4" />,
};

interface StatRowProps {
  label: string;
  value?: number;
  suffix?: string;
  isPercent?: boolean;
}

function StatRow({ label, value, suffix = '', isPercent = false }: StatRowProps) {
  if (value === undefined || value === null) return null;

  const displayValue = isPercent
    ? `${value.toFixed(1)}%`
    : value.toLocaleString();

  return (
    <div className="flex items-center justify-between py-1.5 px-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center">
          {STAT_ICONS[label] || <Zap className="w-4 h-4 text-gray-500" />}
        </div>
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-sm font-bold font-mono text-white">
        {displayValue}{!isPercent ? suffix : ''}
      </span>
    </div>
  );
}

interface StatsPanelProps {
  stats?: CharacterStats;
  crafting?: { discipline: string; rating: number; active: boolean }[];
  titleName?: string;
  masteryPoints?: number;
  achievementPoints?: number;
  wvwRank?: number;
}

export function StatsPanel({ stats, crafting, titleName, masteryPoints, achievementPoints, wvwRank }: StatsPanelProps) {
  // GW2 Formülleri
  const power = stats?.Power ?? 1000;
  const precision = stats?.Precision ?? 1000;
  const toughness = stats?.Toughness ?? 1000;
  const vitality = stats?.Vitality ?? 1000;
  const ferocity = stats?.Ferocity ?? 0;
  const expertise = stats?.Expertise ?? 0;
  const concentration = stats?.Concentration ?? 0;

  // Hesaplanan Statlar
  const critChance = 5 + (precision > 1000 ? (precision - 1000) / 21 : 0);
  const critDamage = 150 + (ferocity / 15);
  const conditionDuration = (expertise / 15);
  const boonDuration = (concentration / 15);

  return (
    <div className="flex flex-col gap-6">
      {/* Savaş İstatistikleri - 2 Sütunlu Izgara (Resimdeki Tasarım) */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-inner">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#eb5e28] mb-4 flex items-center gap-2 px-1">
          Attributes
          <div className="h-px flex-1 bg-gradient-to-r from-[#eb5e28]/50 to-transparent ml-2" />
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {/* Sol Sütun */}
          <div className="flex flex-col">
            <StatRow label="Power" value={power} />
            <StatRow label="Toughness" value={toughness} />
            <StatRow label="Precision" value={precision} />
            <StatRow label="Ferocity" value={ferocity} />
            <StatRow label="Condition Damage" value={stats?.['Condition Damage'] || 0} />
            <StatRow label="Expertise" value={expertise} />
            <StatRow label="Concentration" value={concentration} />
          </div>

          {/* Sağ Sütun */}
          <div className="flex flex-col">
            <StatRow label="Vitality" value={vitality} />
            <StatRow label="Critical Chance" value={critChance} isPercent />
            <StatRow label="Critical Damage" value={critDamage} isPercent />
            <StatRow label="Healing Power" value={stats?.['Healing Power'] || 0} />
            <StatRow label="Condition Duration" value={conditionDuration} isPercent />
            <StatRow label="Boon Duration" value={boonDuration} isPercent />
            <StatRow label="Agony Resistance" value={stats?.['Agony Resistance'] || 0} />
          </div>
        </div>
      </div>

      {/* Hesap İlerlemesi */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-inner">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-4 flex items-center gap-2 px-1">
          Account Progress
          <div className="h-px flex-1 bg-gradient-to-r from-blue-400/50 to-transparent ml-2" />
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex flex-col bg-black/40 rounded-xl p-3 border border-white/5 group hover:border-yellow-500/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[10px] uppercase text-gray-500 font-bold">Achievement Points</span>
            </div>
            <span className="text-sm font-black font-mono text-yellow-500">{achievementPoints?.toLocaleString() || '0'}</span>
          </div>

          <div className="flex flex-col bg-black/40 rounded-xl p-3 border border-white/5 group hover:border-blue-400/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] uppercase text-gray-500 font-bold">Mastery Points</span>
            </div>
            <span className="text-sm font-black font-mono text-blue-400">{masteryPoints || '0'}</span>
          </div>

          <div className="flex flex-col bg-black/40 rounded-xl p-3 border border-white/5 group hover:border-red-400/30 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] uppercase text-gray-500 font-bold">WvW Rank</span>
            </div>
            <span className="text-sm font-black font-mono text-red-400">{wvwRank?.toLocaleString() || '0'}</span>
          </div>

          {titleName && (
            <div className="col-span-full flex flex-col bg-black/40 rounded-xl p-3 border border-white/5 border-l-yellow-500/50">
              <span className="text-[10px] uppercase text-gray-500 font-bold mb-1">Active Title</span>
              <span className="text-sm font-bold text-yellow-300 italic">"{titleName}"</span>
            </div>
          )}
        </div>
      </div>

      {crafting && crafting.length > 0 && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-inner">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-green-400 mb-4 flex items-center gap-2 px-1">
            Crafting Disciplines
            <div className="h-px flex-1 bg-gradient-to-r from-green-400/50 to-transparent ml-2" />
          </h3>
          <div className="flex flex-wrap gap-2">
            {crafting.map((c, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-500/5 border-white/5 text-gray-500'
                  }`}
              >
                {c.discipline} ({c.rating})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
