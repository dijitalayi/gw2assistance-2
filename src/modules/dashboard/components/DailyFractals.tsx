"use client";

import React, { useMemo } from 'react';
import { Activity, ShieldAlert, Zap, Terminal } from 'lucide-react';
import { FRACTAL_ROTATION, getCurrentFractalDay } from '../data/fractalRotation';

export function DailyFractals() {
    const day = useMemo(() => getCurrentFractalDay(), []);
    const data = FRACTAL_ROTATION[day];

    if (!data) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 px-2">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#eb5e28]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6c757d] italic">
                        Strategic Intel
                    </h3>
                </div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Fractal <span className="text-[#eb5e28]">Operations</span>
                </h2>
            </div>

            <div className="bg-[#111318]/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                {/* Progress Indicator */}
                <div className="flex justify-between items-center mb-6 px-1">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-[#495057] uppercase tracking-widest">Active Cycle</span>
                        <span className="text-xs font-black text-white italic">Day {day} of 15</span>
                    </div>
                    <div className="flex gap-1">
                        {[...Array(15)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-1 h-3 rounded-full transition-all ${
                                    (i + 1) === day ? 'bg-[#eb5e28] shadow-[0_0_8px_#eb5e28]' : 
                                    (i + 1) < day ? 'bg-[#eb5e28]/20' : 'bg-white/5'
                                }`} 
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Daily Tier 4 Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Daily Fractal Assignments</span>
                            </div>
                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">T1-T4</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {data.daily.map((name, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-emerald-500/30 transition-all hover:bg-emerald-500/5 group">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-tight">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Levels Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-3.5 h-3.5 text-[#eb5e28]" />
                                <span className="text-[9px] font-black text-[#eb5e28]/80 uppercase tracking-widest">Recommended Scales</span>
                            </div>
                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-[#eb5e28]/10 text-[#eb5e28] rounded border border-[#eb5e28]/20">T1-T3</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {data.recommended.map((lvl, i) => (
                                <div key={i} className="flex flex-col items-center justify-center bg-[#1b1e23] border border-white/5 rounded-2xl p-4 hover:border-[#eb5e28]/30 transition-all">
                                    <span className="text-[8px] font-black text-[#6c757d] uppercase tracking-widest mb-1">Scale</span>
                                    <span className="text-lg font-black text-white italic leading-none">{lvl}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subtle Background Accent */}
                <div className="absolute -bottom-8 -right-8 opacity-5">
                    <Activity className="w-32 h-32" />
                </div>
            </div>

            <div className="flex items-center justify-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-[8px] font-black text-[#6c757d] uppercase tracking-[0.2em] text-center">
                    Synchronization Status: <span className="text-emerald-500">Live Relay Active</span>
                </p>
            </div>
        </div>
    );
}
