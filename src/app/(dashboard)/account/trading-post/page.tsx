'use client';

import React from 'react';
import { TradingPostDashboard } from '@/modules/account/components/TradingPost/TradingPostDashboard';

export default function TradingPostPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <TradingPostDashboard />
      </div>
    </div>
  );
}
