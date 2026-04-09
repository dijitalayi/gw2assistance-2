'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    fetchItemDetails,
    fetchCommercePrices,
    fetchCommerceListings,
    fetchPriceHistory,
    calculateProfit,
    calculateMarketMetrics,
    determineLiquidity,
    getRarityColor,
    COMMERCE_ASSETS
} from '../../services/commerceApi';
import { PriceDisplay } from '@/shared/components/PriceDisplay';
import { MarketTrendChart } from './MarketTrendChart';
import {
    Loader2,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    BarChart4,
    Layers,
    Zap,
    AlertTriangle
} from 'lucide-react';

interface MarketAnalysisProps {
    itemId: number;
}

export function MarketAnalysisTerminal({ itemId }: MarketAnalysisProps) {
    const [selectedRange, setSelectedRange] = React.useState<number | 'ALL'>(14);
    const { data: itemData, isLoading: loadingItem } = useQuery({
        queryKey: ['item-details', itemId],
        queryFn: () => fetchItemDetails(itemId),
        enabled: !!itemId,
        staleTime: 300000,
    });

    const { data: prices, isLoading: loadingPrices } = useQuery({
        queryKey: ['item-prices', itemId],
        queryFn: () => fetchCommercePrices([itemId]),
        enabled: !!itemId,
        refetchInterval: 30000,
    });

    const { data: listings, isLoading: loadingListings } = useQuery({
        queryKey: ['item-listings', itemId],
        queryFn: () => fetchCommerceListings(itemId),
        enabled: !!itemId,
        refetchInterval: 30000,
    });

    // Fetch History for Trends
    const { data: history, isLoading: loadingHistory } = useQuery({
        queryKey: ['item-history', itemId],
        queryFn: () => fetchPriceHistory(itemId, 'day'),
        enabled: !!itemId,
        staleTime: 600000
    });

    const price = prices?.[0];
    const profit = price ? calculateProfit(price.buys.unit_price, price.sells.unit_price) : null;
    const metrics = listings ? calculateMarketMetrics(listings) : null;

    // Advanced Insights
    const liquidity = useMemo(() => determineLiquidity(history || []), [history]);

    // Nexus v8.10: Ghost Data Pruning (Rules of Hooks Compliant)
    const prunedHistory = useMemo(() => {
        const raw = history || [];
        const firstValidIdx = raw.findIndex(d => d.sell_price_avg > 0);
        const validData = firstValidIdx !== -1 ? raw.slice(firstValidIdx) : raw;

        if (selectedRange === 'ALL') return validData;

        const range = typeof selectedRange === 'number' ? selectedRange : 14;
        return validData.length > range ? validData.slice(-range) : validData;
    }, [history, selectedRange]);

    const avgPrice = useMemo(() => {
        if (!history || history.length === 0) return 0;
        const recent = history.slice(0, 7);
        return recent.reduce((acc, h) => acc + h.sell_price_avg, 0) / recent.length;
    }, [history]);

    const isBuyOpportunity = useMemo(() => {
        if (!price || !avgPrice) return false;
        return price.sells.unit_price < (avgPrice * 0.95); // 5% below average
    }, [price, avgPrice]);

    if (loadingItem || !itemData) {
        return (
            <div className="bg-black/40 border border-white/5 rounded-2xl p-32 flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Initializing Market Analysis Module...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-1000 pb-20">

            {/* 1. TOP PANEL: IDENTITY & SCORE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#111318]/60 border border-white/10 rounded-2xl p-8 flex items-center gap-8 relative overflow-hidden group">
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full group-hover:bg-orange-500/40 transition-all duration-700" />
                        <div className="relative w-full h-full bg-black/60 border border-white/10 rounded-2xl p-4 overflow-hidden">
                            <img src={itemData.icon} alt="" className="w-full h-full object-contain relative z-10" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-gray-600 uppercase tracking-widest">ID: {itemData.id}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest italic">Live Link Active</span>
                            </div>
                        </div>
                        <h2 
                          className="text-4xl font-black tracking-tighter uppercase italic"
                          style={{ color: getRarityColor(itemData?.rarity) }}
                        >
                          {itemData.name}
                        </h2>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <span>{itemData.type}</span>
                            <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                            <span>Lvl {itemData.level}</span>
                            <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                            <span className="text-orange-500">{itemData.rarity}</span>
                        </div>
                    </div>
                </div>

                {/* Profit Summary / Buy Opportunity Card */}
                <div className={`border rounded-2xl p-8 flex flex-col justify-between group overflow-hidden relative transition-all duration-500 ${isBuyOpportunity ? 'bg-emerald-500 border-emerald-400 rotate-1' : 'bg-orange-500 border-orange-400'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-gray-900 text-[10px] font-black uppercase tracking-widest">
                            {isBuyOpportunity ? 'BUY OPPORTUNITY DETECTED' : 'Net Profit Report'}
                        </span>
                        {profit ? <PriceDisplay coins={profit.profit} size="lg" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                    </div>
                    <div className="flex items-end justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="text-gray-900 text-[10px] font-black uppercase tracking-widest">Est. Return</span>
                            <span className="text-4xl font-black text-white italic tracking-tighter">
                                {profit ? `${profit.roi.toFixed(1)}%` : '--'}
                            </span>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                            {isBuyOpportunity ? <Zap className="w-8 h-8 text-white animate-pulse" /> : <TrendingUp className="w-8 h-8 text-white" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. INSIGHT PANEL: TREND CHART & VOLUME */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-[#111318]/40 border border-white/10 rounded-2xl p-10 flex flex-col gap-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <BarChart4 className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tighter text-white italic">Price History & Trends</h3>
                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{selectedRange === 'ALL' ? 'All Time' : `Last ${selectedRange} Days`} Perspective (Analysis Engine)</span>
                            </div>
                        </div>

                        <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5">
                            {[14, 30, 90, 'ALL'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setSelectedRange(range as any)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRange === range
                                        ? 'bg-orange-500 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {range}{range !== 'ALL' ? 'D' : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[250px] w-full bg-black/20 rounded-2xl p-6 border border-white/5 relative">
                        {loadingHistory ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500/20" />
                            </div>
                        ) : (
                            <MarketTrendChart data={prunedHistory} />
                        )}
                    </div>
                </div>

                {/* Volume & Liquidity Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="bg-[#111318]/40 border border-white/10 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl h-full">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Market Liquidity</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-2xl font-black italic tracking-tighter ${liquidity === 'INSTANT' || liquidity === 'HIGH' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                    {liquidity}
                                </span>
                                <Zap className={`w-5 h-5 ${liquidity === 'INSTANT' ? 'text-emerald-500 animate-pulse' : 'text-gray-700'}`} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 border-t border-white/5 pt-6">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Daily Sold Volume</span>
                            <span className="text-xl font-black text-white font-mono">
                                {(history?.[history.length - 1]?.sell_sold ?? 0).toLocaleString()}
                            </span>
                            <span className="text-[8px] font-black text-gray-700 uppercase">Unit Movement Rate</span>
                        </div>

                        <div className="flex flex-col gap-1 border-t border-white/5 pt-6">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Volatility Index</span>
                            <span className="text-xl font-black text-white italic">
                                {history && history.length > 0 ? (history[history.length - 1].sell_price_stdev / history[history.length - 1].sell_price_avg * 100).toFixed(2) : '--'}%
                            </span>
                            <span className="text-[8px] font-black text-gray-700 uppercase">Price Stability Rating</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. ORDER BOOK PANEL (EMIR DEFTERI) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full min-h-[500px]">
                <div className="bg-[#111318]/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-white">Buy Orders</h3>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none italic">Demand Side</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">Total Demand</span>
                            <span className="text-xl font-black text-emerald-500">{(metrics?.demand ?? 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <table className="w-full text-[11px] font-black">
                            <thead className="text-gray-600 uppercase tracking-widest text-[9px] border-b border-white/5">
                                <tr>
                                    <th className="pb-4">RANK</th>
                                    <th className="pb-4 italic text-left">UNIT PRICE</th>
                                    <th className="pb-4 text-right">QUANTITY</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {listings?.buys.slice(0, 15).map((order, i) => (
                                    <tr key={i} className="group hover:bg-emerald-500/5 transition-colors">
                                        <td className="py-4 text-gray-700">{i + 1}</td>
                                        <td className="py-4">
                                            <PriceDisplay coins={order.unit_price} size="sm" />
                                        </td>
                                        <td className="py-4 text-right text-emerald-400 font-mono tracking-tighter text-sm">
                                            {(order.quantity ?? 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-[#111318]/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/10 rounded-2xl">
                                <ArrowDownRight className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-white">Sell Listings</h3>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none italic">Supply Side</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">Total Supply</span>
                            <span className="text-xl font-black text-orange-500">{(metrics?.supply ?? 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <table className="w-full text-[11px] font-black">
                            <thead className="text-gray-600 uppercase tracking-widest text-[9px] border-b border-white/5">
                                <tr>
                                    <th className="pb-4">RANK</th>
                                    <th className="pb-4 italic text-left">UNIT PRICE</th>
                                    <th className="pb-4 text-right">QUANTITY</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {listings?.sells.slice(0, 15).map((listing, i) => (
                                    <tr key={i} className="group hover:bg-orange-500/5 transition-colors">
                                        <td className="py-4 text-gray-700">{i + 1}</td>
                                        <td className="py-4">
                                            <PriceDisplay coins={listing.unit_price} size="sm" />
                                        </td>
                                        <td className="py-4 text-right text-orange-400 font-mono tracking-tighter text-sm">
                                            {(listing.quantity ?? 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. SUMMARY BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Offers Group', value: metrics?.offers || '--', icon: Layers, color: 'text-orange-500' },
                    { label: 'Bids Group', value: metrics?.bids || '--', icon: Target, color: 'text-emerald-500' },
                    { label: 'Market Spread', value: profit ? <PriceDisplay coins={price!.sells.unit_price - price!.buys.unit_price} size="sm" /> : '--', icon: Activity, color: 'text-gray-400' },
                    { label: 'Tax Impact (15%)', value: profit ? <PriceDisplay coins={profit.totalTax} size="sm" /> : '--', icon: TrendingUp, color: 'text-gray-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col gap-2 group hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</span>
                            <stat.icon className={`w-4 h-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                        </div>
                        <div className="text-lg font-black text-white italic">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
