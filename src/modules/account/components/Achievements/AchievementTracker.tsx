'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, 
  LayoutGrid,
  Loader2,
  Award,
  ChevronDown,
  ChevronRight,
  Target
} from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';
import { 
  fetchAccountAchievements, 
  fetchAchievementsInfo, 
  fetchAchievementCategories,
  fetchAchievementGroups,
  fetchAccountLuck,
  calculateAPBonuses,
  ASSETS
} from '../../services/accountApi';
import { fetchAccountInfo } from '@/services/gw2Api';

import { AchievementSummaryView } from './AchievementSummaryView';
import { AchievementCategoryDetailView } from './AchievementCategoryDetailView';

export function AchievementTracker() {
  const { apiKey } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // 1. Veri Çekme (Core Data)
  const { data: accountInfo } = useQuery({
    queryKey: ['account', apiKey],
    queryFn: () => fetchAccountInfo(apiKey!),
    enabled: !!apiKey,
  });

  const { data: progress, isLoading: isProgressLoading } = useQuery({
    queryKey: ['account-achievements', apiKey],
    queryFn: () => fetchAccountAchievements(apiKey!),
    enabled: !!apiKey,
  });

  const { data: luckData } = useQuery({
    queryKey: ['account-luck', apiKey],
    queryFn: () => fetchAccountLuck(apiKey!),
    enabled: !!apiKey,
  });

  const { data: groups, isLoading: isGroupsLoading } = useQuery({
    queryKey: ['achievement-groups'],
    queryFn: () => fetchAchievementGroups(),
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['achievement-categories'],
    queryFn: () => fetchAchievementCategories(),
  });

  // Sidebar: Hiyerarşik Yapı Oluşturma
  const hierarchicalCategories = useMemo(() => {
    if (!groups || !categories) return [];
    
    return groups
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        ...group,
        subCategories: categories
          .filter(cat => group.categories.includes(cat.id))
          .sort((a, b) => a.order - b.order)
      }))
      .filter(g => g.subCategories.length > 0);
  }, [groups, categories]);

  // Kategorideki başarımların meta verilerini çekme
  const filteredAchievementIds = useMemo(() => {
    if (selectedCategoryId) {
      const category = categories?.find(c => c.id === selectedCategoryId);
      return category?.achievements || [];
    }
    // Özet sayfasında gösterilecekler
    if (progress) {
      const topDone = progress.filter(p => p.done).slice(0, 10).map(p => p.id);
      const topNearly = progress.filter(p => !p.done && p.max > 0).slice(0, 10).map(p => p.id);
      return Array.from(new Set([...topDone, ...topNearly]));
    }
    return [];
  }, [selectedCategoryId, categories, progress]);

  const { data: achievementsMeta, isLoading: isMetadataLoading } = useQuery({
    queryKey: ['achievements-metadata', filteredAchievementIds],
    queryFn: () => fetchAchievementsInfo(filteredAchievementIds),
    enabled: filteredAchievementIds.length > 0,
  });

  // AP ve Bonus Hesaplamaları
  // AP Verisini Garantileme ve Fallback (2026 Model)
  // Eğer ana achievement_points 0 gelirse, günlük ve aylık AP'leri topluyoruz.
  const totalAp = (accountInfo?.achievement_points && accountInfo.achievement_points > 0) 
    ? accountInfo.achievement_points 
    : (accountInfo ? (accountInfo.daily_ap || 0) + (accountInfo.monthly_ap || 0) : 0);
    
  const luckValue = luckData?.find(l => l.id === 'luck')?.value ?? 0;
  const bonuses = calculateAPBonuses(totalAp);
  const magicFind = accountInfo?.magic_find ?? 0;

  // Özet Verileri (Summary)
  const summaryData = useMemo(() => {
    if (!progress || !achievementsMeta) return null;

    const highPoints = progress
      .filter(p => p.done)
      .map(p => {
        const meta = achievementsMeta.find(a => a.id === p.id);
        if (!meta) return null;
        return { ...meta, points: meta.tiers[meta.tiers.length - 1]?.points || 0, progress: p };
      })
      .filter((a): a is any => a !== null)
      .sort((a, b) => b.points - a.points)
      .slice(0, 4);

    const nearlyFinished = progress
      .filter(p => !p.done && p.max > 0)
      .map(p => {
        const meta = achievementsMeta.find(a => a.id === p.id);
        if (!meta) return null;
        const pct = (p.current / p.max) * 100;
        return { ...meta, percent: pct, progress: p };
      })
      .filter((a): a is any => a !== null)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 4);

    return { highPoints, nearlyFinished };
  }, [progress, achievementsMeta]);

  // Grup açma/kapama
  const toggleGroup = (groupId: string) => {
    const next = new Set(expandedGroups);
    if (next.has(groupId)) next.delete(groupId);
    else next.add(groupId);
    setExpandedGroups(next);
  };

  if (isGroupsLoading || isCategoriesLoading || isProgressLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#eb5e28]" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing Chronicles...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* SIDEBAR: Hierarchical Menu */}
      <div className="lg:col-span-3">
        <div className="bg-[#1a1c23] border border-white/5 rounded-3xl p-4 shadow-xl sticky top-24 max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-6 px-3">
             <LayoutGrid className="w-4 h-4 text-[#eb5e28]" />
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Categories</h3>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 pr-1">
             <button
               onClick={() => { setSelectedCategoryId(null); }}
               className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left mb-2 ${
                 selectedCategoryId === null ? 'bg-[#eb5e28] text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'
               }`}
             >
               <Award className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-tight">Summary</span>
             </button>

             {hierarchicalCategories.map(group => (
               <div key={group.id} className="flex flex-col mb-1">
                 <button
                   onClick={() => toggleGroup(group.id)}
                   className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-colors"
                 >
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300">
                     {group.name}
                   </span>
                   {expandedGroups.has(group.id) ? <ChevronDown className="w-3 h-3 text-gray-600" /> : <ChevronRight className="w-3 h-3 text-gray-600" />}
                 </button>

                 {expandedGroups.has(group.id) && (
                   <div className="flex flex-col gap-1 ml-2 pl-2 border-l border-white/5 py-1 animate-in slide-in-from-top-1 duration-200">
                     {group.subCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group ${
                            selectedCategoryId === cat.id ? 'bg-[#eb5e28]/20 text-[#eb5e28] border border-[#eb5e28]/30 shadow-lg' : 'hover:bg-white/5 text-gray-500 hover:text-white'
                          }`}
                        >
                          <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center ${selectedCategoryId === cat.id ? '' : 'grayscale opacity-60'}`}>
                             {cat.icon ? <img src={cat.icon} className="w-full h-full object-contain" alt="" /> : <Target className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-[11px] font-bold tracking-tight line-clamp-1">{cat.name}</span>
                        </button>
                     ))}
                   </div>
                 )}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* MAIN: Summary or Category View */}
      <div className="lg:col-span-9">
        {selectedCategoryId === null ? (
          <AchievementSummaryView 
            ap={totalAp}
            luck={luckValue}
            magicFind={magicFind}
            bonuses={bonuses}
            highPoints={summaryData?.highPoints || []}
            nearlyFinished={summaryData?.nearlyFinished || []}
            onSelectAchievement={(id) => console.log("Select:", id)}
          />
        ) : (
          <AchievementCategoryDetailView 
            categoryName={categories?.find(c => c.id === selectedCategoryId)?.name || 'Category'}
            categoryIcon={categories?.find(c => c.id === selectedCategoryId)?.icon}
            achievements={achievementsMeta || []}
            progress={progress || []}
            isLoading={isMetadataLoading}
          />
        )}
      </div>
    </div>
  );
}
