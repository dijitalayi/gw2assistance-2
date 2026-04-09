'use client';

import React from 'react';
import { Trophy, CheckCircle2, Star, Eye, Loader2 } from 'lucide-react';
import { AchievementDef, AchievementProgress, ASSETS } from '../../services/accountApi';

interface CategoryDetailProps {
  categoryName: string;
  categoryIcon?: string;
  achievements: AchievementDef[];
  progress: AchievementProgress[];
  isLoading: boolean;
}

export function AchievementCategoryDetailView({ 
  categoryName, 
  categoryIcon, 
  achievements, 
  progress,
  isLoading 
}: CategoryDetailProps) {

  // Calculate overall category progress
  const totalInCat = achievements.length;
  const completedInCat = progress.filter(p => p.done).length;
  const catPercent = totalInCat > 0 ? (completedInCat / totalInCat) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#eb5e28]" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Category...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Category Header */}
      <div className="bg-[#1a1c23] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-6 z-10 relative">
          <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-2">
            {categoryIcon ? <img src={categoryIcon} alt="" className="w-12 h-12" /> : <Trophy className="w-8 h-8 text-[#eb5e28]" />}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">{categoryName}</h2>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-[#eb5e28] transition-all duration-1000"
                  style={{ width: `${catPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-gray-400 whitespace-nowrap">
                {completedInCat} / {totalInCat} Complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Achievement Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements
          .map(meta => ({ 
              meta, 
              prog: progress.find(p => p.id === meta.id) 
          }))
          .sort((a, b) => {
              // Priority: Done first
              if (a.prog?.done && !b.prog?.done) return -1;
              if (!a.prog?.done && b.prog?.done) return 1;
              return 0;
          })
          .map(({ meta, prog }) => (
            <AchievementTile 
              key={meta.id} 
              achievement={meta} 
              progress={prog} 
            />
          ))}
      </div>
    </div>
  );
}

function AchievementTile({ achievement, progress }: { achievement: AchievementDef, progress?: AchievementProgress }) {
  const isDone = progress?.done;
  const percent = progress && !isDone ? (progress.current / progress.max) * 100 : 0;
  const points = achievement.tiers[achievement.tiers.length - 1]?.points || 0;

  return (
    <div className={`relative bg-[#1a1c23] border p-4 rounded-2xl transition-all group cursor-default hover:bg-white/5 ${
        isDone 
        ? 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)] bg-yellow-500/5' 
        : 'border-white/5 hover:border-white/10'
    }`}>
      
      {/* Completion Glow (Subtle) */}
      {isDone && (
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
      )}

      <div className="flex items-start gap-4 h-full">
        {/* Icon with mini progress bar at bottom */}
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center p-1.5 transition-all ${
              isDone ? 'bg-yellow-500/20 border-yellow-500/40' : 'bg-black/40 border-white/10 group-hover:bg-black/60'
          }`}>
             {achievement.icon ? (
               <img src={achievement.icon} alt="" className={`w-10 h-10 transition-all ${!isDone && 'opacity-60 group-hover:opacity-100'}`} />
             ) : (
               <Star className={`w-6 h-6 ${isDone ? 'text-yellow-500' : 'text-gray-700'}`} />
             )}
          </div>
          
          {/* Tile Progress Bar */}
          {!isDone && progress && (
            <div className="absolute -bottom-1 left-1.5 right-1.5 h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-[#eb5e28] rounded-full"
                    style={{ width: `${percent}%` }}
                />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
           <div className="flex items-start justify-between gap-2">
              <h4 className={`text-[12px] font-black uppercase tracking-tight leading-tight line-clamp-2 transition-colors ${
                  isDone ? 'text-yellow-500' : 'text-gray-300 group-hover:text-white'
              }`}>
                {achievement.name}
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0 bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                  <span className="text-[11px] font-mono font-bold text-[#eb5e28]">{points}</span>
                  <img src={ASSETS.AP} className="w-3.5 h-3.5" alt="AP" />
              </div>
           </div>
           
           <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed italic group-hover:text-gray-400 transition-colors">
             {achievement.requirement}
           </p>

           <div className="mt-auto pt-2 flex items-center justify-between">
              {isDone ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <CheckCircle2 className="w-3 h-3 text-yellow-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500/80">Completed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#eb5e28]">{Math.round(percent)}%</span>
                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                      {progress?.current || 0} / {progress?.max || 0}
                    </span>
                </div>
              )}
              
              <button className="p-1 rounded-lg text-gray-700 hover:text-white transition-colors">
                <Eye className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
