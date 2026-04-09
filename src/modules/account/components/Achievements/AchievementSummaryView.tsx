'use client';

import React, { useMemo } from 'react';
import {
  Trophy,
  Star,
  Award,
  Zap,
  ChevronRight,
  Gift,
  Coins,
  Compass,
  TrendingUp,
  Percent
} from 'lucide-react';
import { PriceDisplay } from '@/shared/components/PriceDisplay';
import { ASSETS } from '../../services/accountApi';

interface AchievementSummaryProps {
  ap: number;
  luck: number;
  magicFind: number;
  bonuses: {
    goldFind: number;
    karmaGain: number;
    magicFind: number;
    xpGain: number;
    nextReward: number;
  };
  highPoints: any[];
  nearlyFinished: any[];
  onSelectAchievement: (id: number) => void;
}

export function AchievementSummaryView({
  ap,
  luck,
  magicFind,
  bonuses,
  highPoints,
  nearlyFinished,
  onSelectAchievement
}: AchievementSummaryProps) {

  // Luck Level Calculation (Simplified for UI)
  const luckProgress = (luck % 30000) / 30000 * 100;

  // Chest progress calculation
  const currentInterval = Math.floor(ap / 500) * 500;
  const chestProgress = ((ap - currentInterval) / 500) * 100;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 2. Main Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: High Points (Oyun içi "Recently Completed" yerini alıyor) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-2">
            <TrendingUp className="w-4 h-4 text-[#eb5e28]" />
            High Point Achievements
          </h3>
          <div className="flex flex-col gap-3">
            {highPoints.map((ach) => (
              <SummaryAchievementCard
                key={ach.id}
                achievement={ach}
                onClick={() => onSelectAchievement(ach.id)}
              />
            ))}
          </div>
        </div>

        {/* Middle Column: Nearly Completed */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-2">
            <Zap className="w-4 h-4 text-orange-400" />
            Nearly Completed
          </h3>
          <div className="flex flex-col gap-3">
            {nearlyFinished.map((ach) => (
              <SummaryAchievementCard
                key={ach.id}
                achievement={ach}
                isNearlyFinished
                onClick={() => onSelectAchievement(ach.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Account Bonuses & Luck */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-2">
            <Award className="w-4 h-4 text-blue-400" />
            Account Bonuses
          </h3>

          <div className="bg-[#1a1c23] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
            {/* Luck Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Account Luck</span>
                  <span className="text-sm font-bold text-white">{luck?.toLocaleString() || '0'}</span>
                </div>
                <img src={ASSETS.LUCK} className="w-7 h-7" alt="Luck" />
              </div>
              <div className="h-4 bg-black/40 rounded-full border border-white/5 overflow-hidden flex items-center p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)] transition-all duration-1000"
                  style={{ width: `${luckProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500 text-right font-bold tracking-tight italic">Progress to next MF level</span>
            </div>

            <div className="h-px bg-white/5" />

            {/* Other Stats */}
            <div className="grid grid-cols-1 gap-4">
              <BonusStat label="Magic Find" value={`+${magicFind + bonuses.magicFind}%`} icon={<img src={ASSETS.MAGIC_FIND} className="w-5 h-5" alt="MF" />} />
              <BonusStat label="Gold Find" value={`+${bonuses.goldFind}%`} icon={<img src={ASSETS.GOLD_FIND} className="w-5 h-5" alt="GF" />} />
              <BonusStat label="Karma Gain" value={`+${bonuses.karmaGain}%`} icon={<img src={ASSETS.KARMA} className="w-5 h-5" alt="Karma" />} />
              <BonusStat label="XP Gain" value={`+${bonuses.xpGain}%`} icon={<img src={ASSETS.XP_GAIN} className="w-5 h-5" alt="XP" />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryAchievementCard({ achievement, isNearlyFinished, onClick }: { achievement: any, isNearlyFinished?: boolean, onClick: () => void }) {
  const percent = achievement.progress ? (achievement.progress.current / achievement.progress.max) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className="w-full bg-[#1a1c23] border border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-all text-left flex items-start gap-4 group"
    >
      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden p-1">
        {achievement.icon ? <img src={achievement.icon} alt="" className="w-full h-full object-contain" /> : <Trophy className="w-5 h-5 text-gray-700" />}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h4 className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors truncate">{achievement.name}</h4>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 line-clamp-1 italic">{achievement.requirement}</span>
          <div className="flex items-center gap-1 ml-2 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
            <span className="text-xs font-mono font-bold text-[#eb5e28]">
              {isNearlyFinished ? `%${Math.round(percent)}` : `${achievement.tiers[achievement.tiers.length - 1]?.points || 0}`}
            </span>
            <img src={ASSETS.AP} className="w-3 h-3" alt="AP" />
          </div>
        </div>
        {isNearlyFinished && (
          <div className="h-1 w-full bg-black/40 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[#eb5e28] rounded-full transition-all duration-1000"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}

function BonusStat({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-black font-mono text-white">{value}</span>
    </div>
  );
}
