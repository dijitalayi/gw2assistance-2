'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDailyVault, fetchWeeklyVault, fetchSpecialVault } from '../services/vaultApi';
import { useAuth } from '@/core/contexts/AuthContext';
import { VaultTrack, PlayerObjective } from '../types/vault';
import { Loader2, Gift, Check, Star } from 'lucide-react';

const VaultColumn = ({ title, data, isLoading }: { title: string; data?: VaultTrack; isLoading: boolean }) => {
  if (isLoading || !data) {
    return (
      <div className="flex-1 w-full bg-[#121212]/80 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col items-center justify-center p-6 min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#eb5e28]" />
      </div>
    );
  }

  const metaPercent = data.meta_progress_complete > 0 
    ? Math.min(100, (data.meta_progress_current / data.meta_progress_complete) * 100) 
    : 0;
  
  const metaCompleted = data.meta_progress_current >= data.meta_progress_complete;

  return (
    <div className="flex-1 w-full flex flex-col gap-5">
      {/* Column Header */}
      <div className="text-center">
        <h2 className="font-outfit text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 drop-shadow-lg uppercase tracking-wider">
          {title}
        </h2>
      </div>

      {/* Meta Reward Chest Banner */}
      {data.meta_progress_complete > 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#eb5e28]/20 via-black to-[#1a1a1a] border-t-2 border-[#eb5e28] rounded-lg p-1.5 mb-2 h-24">
          
          <div className="bg-black/40 backdrop-blur-md rounded border border-white/5 px-3 py-2.5 relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gift className={`w-4 h-4 ${metaCompleted ? 'text-yellow-400' : 'text-[#eb5e28]'}`} />
                <span className="font-outfit font-bold text-xs text-gray-200 tracking-wider uppercase">Meta Reward</span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 text-yellow-400 font-black text-sm">
                <span>{data.meta_reward_astral}</span>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/10 relative">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end
                    ${metaCompleted ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' : 'bg-gradient-to-r from-[#eb5e28]/50 to-[#eb5e28]'}`}
                  style={{ width: `${metaPercent}%` }}
                />
              </div>
              <div className="text-right text-[10px] uppercase font-bold text-gray-500 tracking-widest leading-none">
                {data.meta_progress_current} / {data.meta_progress_complete}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-transparent border-t border-dashed border-white/10 flex flex-col items-center justify-center h-24 mb-2 opacity-50 relative">
           <span className="font-outfit text-[10px] text-gray-600 font-bold uppercase tracking-widest absolute top-1/2 -translate-y-1/2">No Meta Reward</span>
        </div>
      )}

      {/* Objectives List */}
      <div className="flex flex-col gap-3">
        {data.objectives.map((obj) => (
          <VaultItem key={obj.id} objective={obj} />
        ))}
      </div>
    </div>
  );
};

const VaultItem = ({ objective }: { objective: PlayerObjective }) => {
  const isCompleted = objective.progress_current >= objective.progress_complete;
  const percentComplete = Math.min(100, (objective.progress_current / objective.progress_complete) * 100);

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border flex flex-col p-4 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg
      ${isCompleted 
        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-500/30' 
        : 'bg-[#1e1e1e]/80 backdrop-blur-sm border-white/10 hover:border-[#eb5e28]/40 shadow-black/40'}`}
    >
      {/* Background Progress Bar for Uncompleted */}
      {!isCompleted && percentComplete > 0 && (
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#eb5e28]/10 to-[#eb5e28]/20 transition-all duration-500 ease-in-out border-r border-[#eb5e28]/30"
          style={{ width: `${percentComplete}%` }}
        />
      )}

      {/* Top Row: Title & Badges */}
      <div className="relative z-10 flex justify-between items-start gap-4 mb-3">
        <h3 className={`font-outfit font-medium text-sm md:text-base leading-snug flex-1
          ${isCompleted ? 'text-green-50' : 'text-gray-100'}`}>
          {objective.title || 'Unknown Objective'}
        </h3>
        
        {/* Track Badge */}
        {objective.track && (
          <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-md shrink-0 self-start
            ${objective.track === 'PvE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 
              objective.track === 'PvP' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 
              'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
            {objective.track}
          </span>
        )}
      </div>
      
      {/* Bottom Row: Progress & Reward */}
      <div className="relative z-10 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-md text-green-400 text-xs font-bold border border-green-500/20">
              <Check className="w-3.5 h-3.5" />
              <span>COMPLETED</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-gray-300 bg-black/40 px-2 py-1 rounded-md border border-white/5">
              {objective.progress_current} <span className="text-gray-500 font-normal mx-0.5">/</span> {objective.progress_complete}
            </div>
          )}
        </div>

        {/* Astral Acclaim Reward */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-sm
          ${isCompleted ? 'text-gray-400 bg-black/20' : 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'}`}>
          <span>{objective.acclaim}</span>
          <Star className={`w-3.5 h-3.5 ${isCompleted ? 'fill-gray-500' : 'fill-yellow-400'}`} />
        </div>
      </div>
    </div>
  );
};

export function VaultTracker() {
  const { apiKey } = useAuth();

  const { data: daily, isLoading: loadingDaily } = useQuery({
    queryKey: ['vault', 'daily', apiKey],
    queryFn: () => fetchDailyVault(apiKey || ''),
    enabled: !!apiKey,
  });

  const { data: weekly, isLoading: loadingWeekly } = useQuery({
    queryKey: ['vault', 'weekly', apiKey],
    queryFn: () => fetchWeeklyVault(apiKey || ''),
    enabled: !!apiKey,
  });

  const { data: special, isLoading: loadingSpecial } = useQuery({
    queryKey: ['vault', 'special', apiKey],
    queryFn: () => fetchSpecialVault(apiKey || ''),
    enabled: !!apiKey,
  });

  if (!apiKey) {
    return (
      <div className="w-full flex-grow flex flex-col items-center justify-center p-12 text-center bg-[#121212]/50 border border-white/5 rounded-3xl backdrop-blur-md">
        <div className="w-16 h-16 bg-[#eb5e28]/20 rounded-full flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-[#eb5e28]" />
        </div>
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">API Key Required</h2>
        <p className="text-gray-400 max-w-md">Please provide a valid Guild Wars 2 API Key in your Settings to sync your live Wizard's Vault progress.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col relative z-10 space-y-8 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <VaultColumn title="Daily" data={daily} isLoading={loadingDaily} />
        <VaultColumn title="Weekly" data={weekly} isLoading={loadingWeekly} />
        <VaultColumn title="Special" data={special} isLoading={loadingSpecial} />
      </div>
    </div>
  );
}
