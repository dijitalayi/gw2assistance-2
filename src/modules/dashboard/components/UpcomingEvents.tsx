'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, Swords, Mountain } from 'lucide-react';
import { useEventTimers } from '../../events/hooks/useEventTimers';

const WAYPOINT_FALLBACK: Record<string, string> = {
    'Crash Site': '[&BIAHAAA=]',
    'Sandstorm': '[&BIAHAAA=]',
    'Battle in Tarir': '[&BAEJAAA=]',
    'Octovine': '[&BAEJAAA=]',
    'Trial by Fire': '[&BN0HAAA=]',
    'Defending Tarir': '[&BAEJAAA=]',
    'Chak Gerent': '[&BPUHAAA=]',
    'Dragonstand': '[&BBAIAAA=]',
    'The Oil Floes': '[&BKYLAAA=]',
    'Concert for the Ages': '[&BPgLAAA=]'
};

function EventCard({ item, type, now }: { item: any; type: 'Boss' | 'Meta'; now: number }) {
    const [copied, setCopied] = useState(false);
    const event = item.config;
    const isBoss = type === 'Boss';
    
    const minsToStart = (item.startMs - now) / 60000;
    const minsLeft = (item.endMs - now) / 60000;

    // Style Matrix (Matching Nexus Dashboard Aesthetic)
    let bgClass = 'bg-[#161616]';
    let borderClass = 'border-[#2a2a2a]';
    let textColor = 'text-gray-100';
    let locationColor = 'text-gray-400';
    let statusColor = 'text-gray-500';
    let timeStr = '';
    let iconSrc = isBoss ? '/images/events/boss_gray.png' : '';

    if (item.status === 'active') {
        bgClass = 'bg-[#054a29]';
        borderClass = 'border-[#2a9134]';
        statusColor = 'text-[#22c55e] font-bold';
        timeStr = `Active (${Math.floor(minsLeft)}m left)`;
        if (isBoss) iconSrc = '/images/events/boss_in_progress.png';
    } else if (minsToStart <= 10) {
        bgClass = 'bg-[#edf2f4]';
        borderClass = 'border-[#d90429]';
        textColor = 'text-black';
        locationColor = 'text-gray-700';
        statusColor = 'text-red-700 font-bold animate-pulse';
        timeStr = `Starts in ${Math.floor(minsToStart)}m`;
        if (isBoss) iconSrc = '/images/events/boss_in_progress.png';
    } else if (minsToStart <= 60) {
        bgClass = 'bg-[#343a40]';
        borderClass = 'border-[#eb5e28]';
        statusColor = 'text-[#eb5e28] font-medium';
        timeStr = `Starts in ${Math.floor(minsToStart)}m`;
        if (isBoss) iconSrc = '/images/events/boss_upcoming.png';
    } else {
        timeStr = `Starts in ${Math.floor(minsToStart)}m`;
    }

    const activeWaypoint = event.waypoint || WAYPOINT_FALLBACK[event.name] || '';

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        if (activeWaypoint) {
            navigator.clipboard.writeText(activeWaypoint);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div 
            onClick={handleCopy}
            className={`relative flex flex-col rounded-xl p-4 transition-all border ${bgClass} ${borderClass} cursor-pointer group hover:opacity-100 opacity-95 overflow-hidden shadow-lg`}
        >
            <div className="relative z-10 flex justify-between items-start mb-3">
                <div className="flex flex-col pr-2">
                    <h4 className={`${textColor} font-black text-sm uppercase tracking-tight leading-tight mb-1`}>{event.name}</h4>
                    <div className="flex items-center gap-1.5">
                        <MapPin className={`w-2.5 h-2.5 ${locationColor}`} />
                        <span className={`${locationColor} text-[10px] font-bold italic truncate max-w-[120px]`}>{event.location || 'Tyria'}</span>
                    </div>
                </div>
                {(event.icon || iconSrc) && (
                    <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        <img 
                            src={event.icon ? `https://render.guildwars2.com/file/${event.icon}.png` : iconSrc} 
                            alt="" 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                )}
            </div>

            <div className={`mt-auto pt-3 border-t flex items-center justify-between ${bgClass === 'bg-[#edf2f4]' ? 'border-gray-300' : 'border-white/5'}`}>
                <span className={`text-[10px] uppercase font-black tracking-tight ${statusColor}`}>
                    {timeStr}
                </span>
                {activeWaypoint && (
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        bgClass === 'bg-[#edf2f4]' 
                            ? 'bg-white text-gray-800 border-gray-300' 
                            : 'bg-black/40 text-gray-400 border-white/5'
                    } group-hover:border-[#eb5e28]`}>
                        {copied ? <span className="text-[#eb5e28] font-bold uppercase">Copied!</span> : activeWaypoint}
                    </span>
                )}
            </div>
        </div>
    );
}

export function UpcomingEvents({ category }: { category: 'World Bosses' | 'Meta Event' }) {
    const { cardData, now } = useEventTimers();

    const nextEvents = useMemo(() => {
        const allEvents = cardData.flatMap(row => row.items);
        
        return allEvents
            .filter(item => {
                const config = item.config;
                if (category === 'World Bosses') {
                    return config.category === 'World Bosses' || config.difficulty === 'Hardcore';
                }
                return config.category === 'Meta Event' || (config.category === 'Group Event' && config.name.includes('Anomaly'));
            })
            .map(item => {
                // Sorting Priority: Active -> Soon -> Future
                let weight = item.startMs - now;
                if (item.status === 'active') {
                    weight = -999999999 + (item.endMs - now);
                } else if (weight < 15 * 60000) {
                    weight -= 500000000;
                }
                return { ...item, nextWeight: weight };
            })
            .sort((a, b) => a.nextWeight - b.nextWeight)
            .slice(0, 3);
    }, [cardData, now, category]);

    return (
        <div className="bg-[#111318]/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl h-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category === 'World Bosses' ? 'bg-[#eb5e28]/10' : 'bg-blue-500/10'}`}>
                        {category === 'World Bosses' ? <Swords className="w-4 h-4 text-[#eb5e28]" /> : <Mountain className="w-4 h-4 text-blue-400" />}
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 italic">
                        {category === 'World Bosses' ? 'World Bosses' : 'Meta Events'}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#eb5e28] rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-[#eb5e28]/60 uppercase tracking-widest">Live Schedule</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {nextEvents.map((item, i) => (
                    <EventCard key={`${item.config.name}-${i}`} item={item} type={category === 'World Bosses' ? 'Boss' : 'Meta'} now={now} />
                ))}
            </div>
        </div>
    );
}
