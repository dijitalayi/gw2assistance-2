'use client';

import React, { useState } from 'react';
import { WalletGrid } from '@/modules/account/components/WalletGrid';
import { CharactersList } from '@/modules/account/components/CharactersList';
import { useAuth } from '@/core/contexts/AuthContext';
import { Star, Shield, Coins } from 'lucide-react';

export default function AccountPage() {
  const { apiKey } = useAuth();
  const [activeTab, setActiveTab] = useState<'characters' | 'wallet'>('characters');

  if (!apiKey) {
    return (
      <div className="w-full flex-grow flex flex-col items-center justify-center p-12 text-center bg-[#121212]/50 border border-white/5 rounded-3xl backdrop-blur-md">
        <div className="w-16 h-16 bg-[#eb5e28]/20 rounded-full flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-[#eb5e28]" />
        </div>
        <h2 className="text-2xl font-outfit font-bold text-white mb-2">API Key Required</h2>
        <p className="text-gray-400 max-w-md">Please provide a valid Guild Wars 2 API Key in your Settings to sync your account progression.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full text-white pb-10 p-4 lg:p-8">
      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-8 gap-8">
        <button 
          onClick={() => setActiveTab('characters')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-all font-outfit text-lg tracking-wide ${activeTab === 'characters' ? 'border-[#eb5e28] text-[#eb5e28] font-bold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <Shield className="w-5 h-5" />
          Characters
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-all font-outfit text-lg tracking-wide ${activeTab === 'wallet' ? 'border-[#eb5e28] text-[#eb5e28] font-bold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <Coins className="w-5 h-5" />
          Wallet
        </button>
      </div>

      {/* Active View */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'characters' && <CharactersList />}
        {activeTab === 'wallet' && <WalletGrid />}
      </div>

    </div>
  );
}
