import React, { useState, useEffect } from 'react';
import { useEventTimers, CardEventData } from '../hooks/useEventTimers';

function formatTimeLeft(ms: number) {
  if (ms < 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function EventCard({ item, now, copiedId, setCopiedId }: { item: CardEventData, now: number, copiedId: string | null, setCopiedId: (id: string | null) => void }) {
  const isBoss = item.config.category === 'World Bosses' || item.config.difficulty === 'Hardcore';
  const isDayNight = item.config.category === 'Day-Night Cycle';

  const minsToStart = (item.startMs - now) / 60000;

  let iconSrc = '';
  // Default values
  let bgClass = 'bg-[#161616]';
  let borderClass = 'border-[#2a2a2a]';
  let iconBorderClass = 'border-[#333]';
  let iconBgClass = 'bg-[#111]';
  let textColor = 'text-gray-100';
  let locationColor = 'text-gray-400';
  let copyBgClass = 'bg-[#111] text-gray-400 border-[#333]';

  if (item.status === 'active') {
    // 1. ACTIVE STATE (Already started)
    if (isBoss) iconSrc = '/images/events/boss_in_progress.png'; // Red skull is technically the only action icon we have
    bgClass = 'bg-[#054a29]';  // Very dark green tinted bg
    borderClass = 'border-[#2a9134]'; // Green border
    iconBorderClass = 'border-[#2a9134]';
    iconBgClass = 'bg-[#054a29]';
    copyBgClass = 'bg-[#054a29] text-white border-[#14532d] shadow-[0_0_8px_rgba(34,197,94,0.15)]';
  } else if (minsToStart <= 10) {
    // 2. < 10 MINS (RED ALERT)
    if (isBoss) iconSrc = '/images/events/boss_in_progress.png';
    bgClass = 'bg-[#edf2f4]';
    borderClass = 'border-[#d90429]';
    iconBorderClass = 'border-[#d90429]';
    iconBgClass = 'bg-[#ffffff]';
    textColor = 'text-black';
    locationColor = 'text-gray-700';
    copyBgClass = 'bg-white text-gray-800 border-gray-300';
  } else if (minsToStart <= 60) {
    // 3. 10 to 60 MINS (ORANGE)
    if (isBoss) iconSrc = '/images/events/boss_upcoming.png';
    bgClass = 'bg-[#343a40]';
    borderClass = 'border-[#eb5e28]';
    iconBorderClass = 'border-[#eb5e28]';
    iconBgClass = 'bg-[#2a2d32]';
  } else {
    // 4. > 60 MINS (DEFAULT GRAY)
    if (isBoss) iconSrc = '/images/events/boss_gray.png';
  }

  // Calculate generic countdown
  let timeStr = '';
  let statusColor = '';

  if (item.status === 'active') {
    timeStr = `Active (${formatTimeLeft(item.endMs - now)} left)`;
    statusColor = 'text-[#22c55e] font-bold tracking-wide drop-shadow-sm'; // Green text
  } else if (item.status === 'upcoming') {
    timeStr = `Starts in ${formatTimeLeft(item.startMs - now)}`;
    if (minsToStart <= 10) statusColor = 'text-red-700 font-bold';
    else if (minsToStart <= 60) statusColor = 'text-[#eb5e28] font-medium';
    else statusColor = 'text-gray-500';
  } else {
    timeStr = `Ended ${formatTimeLeft(now - item.endMs)} ago`;
    statusColor = 'text-gray-500';
  }

  const handleCopy = () => {
    if (isDayNight || !item.config.waypoint) return;

    // Copy format request: "02:45 - Shadow Behemoth: [&BPcAAAA=]"
    const d = new Date(item.startMs);
    const p = (n: number) => n.toString().padStart(2, '0');
    const timeStrFormat = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;

    const text = `${timeStrFormat} - ${item.config.name}: ${item.config.waypoint}`;
    navigator.clipboard.writeText(text);

    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      onClick={handleCopy}
      className={`relative flex flex-col rounded-md p-4 transition-all border-[1.5px] ${bgClass} ${borderClass}
        ${!isDayNight && item.config.waypoint ? 'cursor-pointer hover:-translate-y-0.5 opacity-95 hover:opacity-100' : 'cursor-default'}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col pr-2">
          <h4 className={`${textColor} font-bold text-sm md:text-base leading-tight mb-1`}>{item.config.name}</h4>
          {item.config.location && (
            <span className={`${locationColor} text-xs italic`}>{item.config.location}</span>
          )}
        </div>
        {(item.config.icon || iconSrc) && (
          <div className={`w-10 h-10 shrink-0 ml-2 rounded-lg p-1 border flex items-center justify-center ${iconBgClass} ${iconBorderClass} overflow-hidden shadow-inner`}>
            <img 
              src={item.config.icon ? `https://render.guildwars2.com/file/${item.config.icon}.png` : iconSrc} 
              alt={item.config.name} 
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          </div>
        )}
      </div>

      <div className={`mt-auto pt-3 border-t flex items-center justify-between ${bgClass === 'bg-[#edf2f4]' ? 'border-gray-300' : 'border-[#2a2a2a]'}`}>
        <span className={`text-[11px] md:text-xs ${statusColor}`}>{timeStr}</span>
        {item.config.waypoint && (
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${copyBgClass}`}>
            {copiedId === item.id ? <span className="text-[#eb5e28] font-bold">Copied!</span> : item.config.waypoint}
          </span>
        )}
      </div>
    </div>
  )
}

export function EventDashboard() {
  const { cardData, now } = useEventTimers();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [localTime, setLocalTime] = useState<string>('');
  const [serverTime, setServerTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setLocalTime(d.toLocaleTimeString('en-US', { hour12: false }));
      setServerTime(d.toISOString().substr(11, 8)); // Extracts HH:mm:ss
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full text-gray-200">

      {/* Shared Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-3 border-b border-[#2a2a2a] mb-6 gap-4">
        <div className="flex items-center gap-6 font-mono text-sm">
          <span className="text-[#eb5e28] font-bold">Local: <span className="text-white">{localTime}</span></span>
          <span className="text-gray-400 font-bold">Server UTC: <span className="text-white">{serverTime}</span></span>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 bg-[#161616] px-3 py-1.5 rounded-full border border-[#2a2a2a]">
            Click any active or upcoming card to copy its waypoint.
          </span>
        </div>
      </div>

      {/* Grid Iteration */}
      <div className="flex flex-col w-full">
        {cardData.map(row => {
          if (row.items.length === 0) return null;

          return (
            <div key={row.id} className="mb-8 w-full">
              {/* Group Title */}
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-bold text-gray-100 tracking-wide uppercase">{row.title}</h3>
                <div className="ml-4 h-px flex-1 bg-gradient-to-r from-[#2a2a2a] to-transparent"></div>
              </div>

              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {row.items.map(item => (
                  <EventCard
                    key={item.id}
                    item={item}
                    now={now}
                    copiedId={copiedId}
                    setCopiedId={setCopiedId}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
