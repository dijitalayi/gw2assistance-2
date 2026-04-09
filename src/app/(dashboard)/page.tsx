"use client";

import { useAuth } from "@/core/contexts/AuthContext";
import {
    LayoutDashboard,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { WalletSnapshot } from "@/modules/dashboard/components/WalletSnapshot";
import { MarketHotDeals } from "@/modules/dashboard/components/MarketHotDeals";
import { UpcomingEvents } from "@/modules/dashboard/components/UpcomingEvents";
import { EngineStatus } from "@/modules/dashboard/components/EngineStatus";
import { DailyFractals } from "@/modules/dashboard/components/DailyFractals";
import { useQuery } from "@tanstack/react-query";
import { fetchAccountInfo } from "@/services/gw2Api";

export default function DashboardPage() {
    const { apiKey } = useAuth();

    const { data: accountInfo } = useQuery({
        queryKey: ['account', apiKey],
        queryFn: () => fetchAccountInfo(apiKey as string),
        enabled: !!apiKey
    });

    return (
        <div className="flex flex-col gap-10 min-h-screen pb-20 animate-in fade-in duration-1000">

            {/* 1. Header Section: Identity & Assets */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/5 pb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#eb5e28] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(235,94,40,0.3)]">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
                            Command <span className="text-[#eb5e28]">Center</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6c757d] ml-1">
                        Strategic Account Intelligence Overview
                    </p>
                </div>
                <WalletSnapshot />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                {/* 2. Main Live Feed (Left 3 Columns) */}
                <div className="xl:col-span-3 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <MarketHotDeals />
                        </div>
                        <div className="md:col-span-1">
                            <UpcomingEvents category="World Bosses" />
                        </div>
                        <div className="md:col-span-1">
                            <UpcomingEvents category="Meta Event" />
                        </div>
                    </div>

                    {/* Welcome / Info Card */}
                    <div className="bg-[#111318]/40 border border-white/5 rounded-3xl p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <LayoutDashboard className="w-64 h-64 -rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
                            <h2 className="text-2xl font-bold uppercase tracking-tighter text-white italic">
                                Welcome back, <span className="text-[#eb5e28]">{accountInfo?.name || 'Commander'}</span>
                            </h2>
                            <p className="text-[#adb5bd] text-sm leading-relaxed">
                                The nexus engine has analyzed <span className="text-white font-bold italic">27,921 assets</span> across the Tyrian market.
                                Live data synchronization is active. Your current liquid wealth is optimized for immediate trading.
                            </p>
                            <div className="flex items-center gap-6 mt-4">
                                <Link href="/account/trading-post/market" className="px-6 py-3 bg-[#eb5e28] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg">
                                    Open Market Terminal
                                </Link>
                                <a href="https://wiki.guildwars2.com" target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6c757d] hover:text-white transition-colors">
                                    Knowledge Base <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Strategic Intelligence Sidebar (Right 1 Column) */}
                <div className="flex flex-col gap-4">
                    <DailyFractals />
                </div>
            </div>

            {/* 4. Global Status Bar */}
            <EngineStatus />
        </div>
    );
}
