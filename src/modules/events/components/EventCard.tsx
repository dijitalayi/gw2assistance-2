import React from 'react';
import { ComputedEvent } from '../types/event';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';

function formatTimeLeft(msTotal: number): string {
  if (msTotal <= 0) return '00:00:00';
  const totalSeconds = Math.floor(msTotal / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  const p = (n: number) => n.toString().padStart(2, '0');
  
  if (h > 0) return `${p(h)}:${p(m)}:${p(s)}`;
  return `${p(m)}:${p(s)}`;
}

export function EventCard({ computed }: { computed: ComputedEvent }) {
  const { config, isActive, isSpawning, timeUntilSpawnMs, durationPercent } = computed;
  
  const isImminent = timeUntilSpawnMs > 0 && timeUntilSpawnMs <= 15 * 60 * 1000; // <= 15 mins
  
  const statusColor = isActive ? 'bg-green-500/20 border-green-500/50' 
                   : isSpawning ? 'bg-yellow-500/20 border-yellow-500/50' 
                   : isImminent ? 'bg-[#eb5e28]/10 border-[#eb5e28]/30'
                   : 'bg-[#1e1e1e]/80 border-white/5';
                   
  const textColor = isActive ? 'text-green-400' 
                   : isSpawning ? 'text-yellow-400' 
                   : isImminent ? 'text-[#eb5e28]'
                   : 'text-gray-400';

  // Determine which local icon to use as a fallback if gw2wiki icon isn't preferred or fails
  let statusIconPath = '/images/events/boss_gray.png';
  if (isActive) statusIconPath = '/images/events/boss_in_progress.png';
  else if (isImminent) statusIconPath = '/images/events/boss_upcoming.png';

  const defaultGw2Icon = config.icon ? `https://wiki.guildwars2.com/images/${config.icon}.png` : statusIconPath;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-3 flex gap-4 transition-all duration-300 hover:shadow-lg ${statusColor}`}>
      
      {/* Active Duration Progress Bar Background */}
      {isActive && (
         <div 
           className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/10 to-green-500/20 transition-all duration-1000 ease-linear"
           style={{ width: `${durationPercent}%` }}
         />
      )}

      {/* Main content relative positioned to sit above absolute background */}
      <div className="relative z-10 w-12 h-12 rounded-lg bg-black/40 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-1">
        <img 
          src={defaultGw2Icon} 
          alt={config.name} 
          className="w-full h-full object-contain opacity-90 drop-shadow-md"
          onError={(e) => { e.currentTarget.src = statusIconPath; }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center min-w-0">
        <h3 className="font-outfit font-bold text-sm text-gray-100 truncate pr-2">
          {config.name}
        </h3>
        
        <div className="flex items-center gap-3 mt-1">
          {config.location && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{config.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timer / Status */}
      <div className="relative z-10 flex flex-col items-end justify-center shrink-0 w-20">
        {isActive ? (
          <>
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-0.5">Active</span>
            <div className="text-xs font-mono font-bold text-green-300 bg-green-900/40 px-2 py-0.5 rounded border border-green-500/20">
              {Math.floor(durationPercent)}%
            </div>
          </>
        ) : (
          <>
            {isSpawning && <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-0.5 animate-pulse">Spawning</span>}
            {!isSpawning && isImminent && <span className="text-[10px] font-bold text-[#eb5e28] uppercase tracking-widest mb-0.5">Soon</span>}
            <div className={`flex items-center gap-1 text-sm font-mono font-bold ${textColor}`}>
              <Clock className="w-3 h-3" />
              <span>{formatTimeLeft(timeUntilSpawnMs)}</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
