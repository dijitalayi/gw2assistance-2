'use client';

import React, { useState } from 'react';
import { MaterialStorage } from '@/modules/inventory/components/MaterialStorage';
import { BankStorage } from '@/modules/inventory/components/BankStorage';
import { CharacterBags } from '@/modules/inventory/components/CharacterBags';
import { useAuth } from '@/core/contexts/AuthContext';
import { PackageOpen, Archive, Users } from 'lucide-react';

export default function InventoryPage() {
  const { apiKey } = useAuth();
  const [activeTab, setActiveTab] = useState<'materials' | 'bank' | 'bags'>('materials');
  
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
    <div className="flex flex-col w-full h-full text-white pb-10 p-4 lg:p-8">
      
      {/* Tabs Layout */}
      <div className="flex border-b border-[#2a2a2a] mb-6 gap-8">
        <button 
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-all font-outfit text-lg tracking-wide ${activeTab === 'materials' ? 'border-[#eb5e28] text-[#eb5e28] font-bold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <PackageOpen className="w-5 h-5" />
          Materials
        </button>
        <button 
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-all font-outfit text-lg tracking-wide ${activeTab === 'bank' ? 'border-[#eb5e28] text-[#eb5e28] font-bold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <Archive className="w-5 h-5" />
          Bank Vault
        </button>
        <button 
          onClick={() => setActiveTab('bags')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-all font-outfit text-lg tracking-wide ${activeTab === 'bags' ? 'border-[#eb5e28] text-[#eb5e28] font-bold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <Users className="w-5 h-5" />
          Character Bags
        </button>
      </div>

      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'materials' && <MaterialStorage />}
        {activeTab === 'bank' && <BankStorage />}
        {activeTab === 'bags' && <CharacterBags />}
      </div>
    </div>
  );
}
