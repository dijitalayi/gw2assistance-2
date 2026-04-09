'use client';

import React from 'react';
import { ApiCard } from '@/modules/account/components/Settings/ApiCard';
import { MarketLogicCard } from '@/modules/account/components/Settings/MarketLogicCard';
import { Settings, Shield, Zap, Globe, Cpu } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <ApiCard />
                <MarketLogicCard />
            </div>

            {/* Footer / System Status Bar */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Builder', value: 'DIJITALAYI', icon: Cpu },
                    { label: 'API Region', value: 'NCSoft-EU', icon: Globe },
                    { label: 'Security Protocols', value: 'High Clarity', icon: Shield }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                        <item.icon className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{item.label}</span>
                            <span className="text-xs font-bold text-white uppercase">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
