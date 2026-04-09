'use client';

import React, { useState, useEffect } from 'react';
import { Target, Zap, Activity, Info, RefreshCw, Trash2, ChevronDown } from 'lucide-react';

export function MarketLogicCard() {
    const [roi, setRoi] = useState(10);
    const [status, setStatus] = useState<'IDLE' | 'CLEARING' | 'DONE'>('IDLE');

    useEffect(() => {
        const storedRoi = localStorage.getItem('nexus_min_roi');
        if (storedRoi) setRoi(parseInt(storedRoi));
    }, []);

    const handleRoiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setRoi(val);
        localStorage.setItem('nexus_min_roi', val.toString());
    };

    const handleClearCache = () => {
        setStatus('CLEARING');
        setTimeout(() => {
            // Clearing logic
            localStorage.removeItem('nexus_market_data_cache');
            setStatus('DONE');
            setTimeout(() => setStatus('IDLE'), 2000);
        }, 1200);
    };

    return (
        <div className="bg-[#111318]/40 border border-white/10 rounded-3xl p-8 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                        <Target className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Nexus Logic</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Engine Tuning & Thresholds</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Engine Optimized</span>
                </div>
            </div>

            <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tighter">Profit Threshold (ROI)</span>
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-loose">Items below this margin will be hidden in Pulse</span>
                    </div>
                    <span className="text-3xl font-black text-[#eb5e28] italic">%{roi}</span>
                </div>

                <div className="relative pt-2 pb-8">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={roi}
                        onChange={handleRoiChange}
                        className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-[#eb5e28] border border-white/5"
                    />
                    <div className="flex justify-between mt-3 px-1">
                        {[0, 25, 50, 75, 100].map(val => (
                            <span key={val} className="text-[8px] font-black text-gray-800 uppercase tracking-tighter">%{val}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-8 border-t border-white/5">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative group/select">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Sync Interval</span>
                        <Activity className="w-3 h-3 text-emerald-500/30" />
                    </div>
                    <div className="relative">
                        <select className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none appearance-none cursor-pointer hover:border-emerald-500/30 transition-all">
                            <option value="60" className="bg-[#111318] text-white">Fast (1m)</option>
                            <option value="300" className="bg-[#111318] text-white">Standard (5m)</option>
                            <option value="900" className="bg-[#111318] text-white">Slow (15m)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-3 h-3 text-gray-600 group-hover/select:text-emerald-500 transition-colors" />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleClearCache}
                    disabled={status === 'CLEARING'}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:bg-red-500/10 hover:border-red-500/30 transition-all text-left"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover:text-red-500 transition-colors">Maintenance</span>
                        {status === 'CLEARING' ? <RefreshCw className="w-3 h-3 text-red-500 animate-spin" /> : <Trash2 className="w-3 h-3 text-gray-800" />}
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-red-300">
                        {status === 'DONE' ? 'Cache Cleared' : 'Clear Market Cache'}
                    </span>
                </button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl mt-4">
                <Info className="w-4 h-4 text-orange-500/40 shrink-0" />
                <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
                    Higher ROI thresholds provide safer margins but fewer opportunities. Nexus v8.x recommends <span className="text-orange-500 font-black">25-40%</span> for optimal turnover.
                </p>
            </div>
        </div>
    );
}
