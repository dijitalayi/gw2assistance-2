'use client';

import React, { useMemo, useState } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { HistoryData } from '../../services/commerceApi';
import { PriceDisplay } from '@/shared/components/PriceDisplay';

interface MarketTrendChartProps {
  data: HistoryData[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#0a0b0d]/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-4 shadow-3xl flex flex-col gap-1 items-end animate-in fade-in zoom-in-95 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-[0.2em]">Market Insight</span>
                </div>
                <PriceDisplay coins={data.sell_price_avg} size="sm" />
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest mt-1">
                    {new Date(data.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
            </div>
        );
    }
    return null;
};

export function MarketTrendChart({ data, height = 250 }: MarketTrendChartProps) {
    // Recharts resize warning prevention
    const [isMounted, setIsMounted] = useState(false);
    
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const chartData = useMemo(() => data || [], [data]);

    if (!isMounted || chartData.length === 0) {
        return <div style={{ height }} className="w-full bg-white/[0.01] rounded-3xl animate-pulse" />;
    }

    return (
        <div className="w-full relative" style={{ height }}>
            <ResponsiveContainer width="100%" height={height} debounce={100}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="rgba(255,255,255,0.03)" 
                    />

                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['auto', 'auto']} />

                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ stroke: 'rgba(249,115,22,0.2)', strokeWidth: 1 }}
                    />

                    <Area
                        type="monotone"
                        dataKey="sell_price_avg"
                        stroke="#f97316"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#premiumGradient)"
                        animationDuration={1000}
                        activeDot={{ 
                            r: 5, 
                            fill: '#fff', 
                            stroke: '#f97316', 
                            strokeWidth: 2,
                            className: "drop-shadow-[0_0_10px_#f97316]"
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Axis Overlays - Dinamik Tarih Odaklaması */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-between px-8 text-[8px] font-black text-white/20 uppercase tracking-[0.2em] pointer-events-none">
                <span>{chartData[0] ? new Date(chartData[0].date).toLocaleDateString('tr-TR') : '--'}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity italic">Data Density: {chartData.length} Points</span>
                <span>{chartData[chartData.length - 1] ? new Date(chartData[chartData.length - 1].date).toLocaleDateString('tr-TR') : '--'}</span>
            </div>
        </div>
    );
}
