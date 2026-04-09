'use client';

import React from 'react';
import { MaterialStorage } from '@/modules/inventory/components/MaterialStorage';
import { useAuth } from '@/core/contexts/AuthContext';
import { PackageOpen } from 'lucide-react';

export default function InventoryPage() {
  const { apiKey } = useAuth();
  
  if (!apiKey) {
    return (
      <div className="w-full flex-grow flex flex-col items-center justify-center p-12 text-center bg-[#121212]/50 border border-white/5 rounded-3xl backdrop-blur-md">
        <div className="w-16 h-16 bg-[#eb5e28]/20 rounded-full flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-[#eb5e28]" />
        </div>
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">API Key Required</h2>
        <p className="text-gray-400 max-w-md">Please provide a valid Guild Wars 2 API Key in your Settings to sync your inventory and materials.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full text-white pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-[#eb5e28]/10 text-[#eb5e28]">
          <PackageOpen className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-outfit font-bold text-white drop-shadow-md leading-tight">Inventory & Storage</h1>
          <p className="text-gray-400">Manage your material storage and deeply search your inventories.</p>
        </div>
      </div>

      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <MaterialStorage />
      </div>

    </div>
  );
}
