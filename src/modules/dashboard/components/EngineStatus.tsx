'use client';

import React, { useState, useEffect } from 'react';
import { marketSync } from '@/modules/account/services/marketSync';
import { Database, Activity, Cpu, CheckCircle2 } from 'lucide-react';

export function EngineStatus() {
  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState({
    isBusy: false,
    totalCount: 0,
    progress: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        isBusy: marketSync.isBusy(),
        totalCount: marketSync.getTotalCount(),
        progress: 0 // Mock progress for UI if needed, or derived from total/estimated
      });
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#212529] border border-[#343a40] rounded-2xl p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${stats.isBusy ? 'bg-[#eb5e28]/10' : 'bg-emerald-500/10'}`}>
          {stats.isBusy ? <Cpu className="w-4 h-4 text-[#eb5e28] animate-pulse" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Market Engine</span>
            <div className={`w-1.5 h-1.5 rounded-full ${stats.isBusy ? 'bg-[#eb5e28] animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
          </div>
          <span className="text-[8px] font-black text-[#6c757d] uppercase tracking-[0.2em]">
            {stats.isBusy ? 'Indexing Global Assets...' : 'Core Database Synchronized'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[8px] font-black text-[#495057] uppercase tracking-widest leading-none">Total Assets</span>
          <span className="text-sm font-black text-[#adb5bd] italic tracking-tighter">{stats.totalCount.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-[#495057] uppercase tracking-widest leading-none">Status</span>
            <span className={`text-[10px] font-black italic tracking-tighter ${stats.isBusy ? 'text-[#eb5e28]' : 'text-emerald-500'}`}>
                {stats.isBusy ? 'BUSY' : 'OPERATIONAL'}
            </span>
        </div>
      </div>
    </div>
  );
}
