'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Zap, 
  Map as MapIcon, 
  ChevronRight, 
  Star,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';
import { 
  fetchAccountMasteries, 
  fetchMasteriesInfo,
  fetchMasteryPoints
} from '../../services/accountApi';

export function MasteryTracker() {
  const { apiKey } = useAuth();

  // 1. Account Mastery Progress
  const { data: accountMasteries, isLoading: isProgressLoading } = useQuery({
    queryKey: ['account-masteries', apiKey],
    queryFn: () => fetchAccountMasteries(apiKey!),
    enabled: !!apiKey,
  });

  // 2. Mastery Points (Summary)
  const { data: masteryPoints, isLoading: isPointsLoading } = useQuery({
    queryKey: ['mastery-points', apiKey],
    queryFn: () => fetchMasteryPoints(apiKey!),
    enabled: !!apiKey,
  });

  // 3. Metadata
  const { data: masteriesMeta, isLoading: isMetaLoading } = useQuery({
    queryKey: ['masteries-all-meta'],
    queryFn: () => fetchMasteriesInfo(),
  });

  // Group by Region
  const regionsData = useMemo(() => {
    if (!masteriesMeta || !accountMasteries) return {};
    
    const groups: Record<string, any[]> = {};
    
    masteriesMeta.forEach(meta => {
      const prog = accountMasteries.find(p => p.id === meta.id);
      const region = meta.region;
      
      if (!groups[region]) groups[region] = [];
      
      const currentLevelIndex = prog ? prog.level : 0;
      const totalLevels = meta.levels.length;
      const percent = (currentLevelIndex / totalLevels) * 100;
      
      groups[region].push({
        ...meta,
        currentLevel: currentLevelIndex,
        totalLevels,
        percent,
        currentLevelName: currentLevelIndex > 0 ? meta.levels[currentLevelIndex - 1].name : 'Locked'
      });
    });
    
    return groups;
  }, [masteriesMeta, accountMasteries]);

  const totalMasteryLevel = useMemo(() => {
    return accountMasteries?.reduce((acc, curr) => acc + curr.level, 0) || 0;
  }, [accountMasteries]);

  if (isProgressLoading || isMetaLoading || isPointsLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#eb5e28]" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Mastery Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#1a1c23] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap className="w-32 h-32 text-[#eb5e28]" />
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#eb5e28]">Total Mastery</span>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-black text-white">{totalMasteryLevel}</h2>
            <span className="text-lg font-bold text-gray-500 mb-1">Level</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-l border-white/10 pl-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Mastery Points</span>
          <div className="flex flex-col gap-1">
            {masteryPoints?.totals.map(t => (
              <div key={t.region} className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">{t.region}</span>
                <span className="font-mono font-bold text-white">{t.earned}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-l border-white/10 pl-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">Progression Summary</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 flex-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400" 
                style={{ width: `${Math.min(100, (totalMasteryLevel / 500) * 100)}%` }} 
              />
            </div>
            <span className="text-xs font-bold text-white">%{Math.round((totalMasteryLevel / 500) * 100)}</span>
          </div>
          <p className="text-[10px] text-gray-500 italic mt-1">* Calculated out of 500 levels.</p>
        </div>
      </div>

      {/* Reginal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(regionsData).map(([region, items]) => (
          <div key={region} className="flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3 px-2">
              <MapIcon className="w-4 h-4 text-[#eb5e28]/60" />
              {region}
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {items.map((m) => (
                <div key={m.id} className="bg-[#1a1c23] border border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-all group relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 h-0.5 bg-[#eb5e28]/20 transition-all duration-1000" 
                    style={{ width: `${m.percent}%` }}
                  />

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <img src={m.levels[0].icon} alt="" className={`w-8 h-8 ${m.currentLevel === 0 ? 'grayscale opacity-30 text-gray-500' : ''}`} />
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold tracking-tight transition-colors ${m.currentLevel === 0 ? 'text-gray-500' : 'text-white group-hover:text-[#eb5e28]'}`}>
                          {m.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-gray-500">
                          {m.currentLevel} / {m.totalLevels}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-gray-600 line-clamp-1 italic">{m.currentLevelName}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: m.totalLevels }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full border border-white/5 ${
                                i < m.currentLevel ? 'bg-[#eb5e28] shadow-[0_0_5px_rgba(235,94,40,0.5)]' : 'bg-black/40'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
