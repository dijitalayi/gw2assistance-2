"use client";

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Layers, LogOut, Home, Map, Calendar, Users, Backpack, ShoppingBag, Trophy, Award, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/core/contexts/AuthContext';
import { fetchAccountInfo } from '@/services/gw2Api';
import { useQuery } from '@tanstack/react-query';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { apiKey, setApiKey } = useAuth();

  const { data: accountInfo, isLoading } = useQuery({
    queryKey: ['accountInfo', apiKey],
    queryFn: () => fetchAccountInfo(apiKey as string),
    enabled: !!apiKey,
  });

  const handleLogout = () => {
    setApiKey(null);
    router.push('/login');
  };

  // Determine current page header meta
  let Icon = Home;
  let pageTitle = 'Dashboard';
  let pageDescription = 'Select a module below to start managing your account.';

  if (pathname.startsWith('/map')) {
    Icon = Map;
    pageTitle = 'Live Map';
    pageDescription = 'Interactive Tyria map with real-time location and event tracking.';
  } else if (pathname.startsWith('/vault')) {
    Icon = Layers;
    pageTitle = "Wizard's Vault";
    pageDescription = 'Track your daily, weekly, and special objectives.';
  } else if (pathname.startsWith('/events')) {
    Icon = Calendar;
    pageTitle = "Event Timers";
    pageDescription = 'Live countdowns for automated server-wide events.';
  } else if (pathname.startsWith('/account/characters')) {
    Icon = Users;
    pageTitle = "Characters & Wallet";
    pageDescription = 'Manage your characters, builds, and account currencies.';
  } else if (pathname.startsWith('/account/inventory')) {
    Icon = Backpack;
    pageTitle = "Material Storage";
    pageDescription = 'Track your items and deeply search your material storage.';
  } else if (pathname.startsWith('/account/trading-post')) {
    Icon = ShoppingBag;
    pageTitle = "Trading Post";
    pageDescription = 'Manage your marketplace activities and transaction history.';
  } else if (pathname.startsWith('/account/achievements')) {
    Icon = Trophy;
    pageTitle = "Achievements";
    pageDescription = 'Track your account progression and nearly finished titles.';
  } else if (pathname.startsWith('/account/masteries')) {
    Icon = Award;
    pageTitle = "Mastery Progress";
    pageDescription = 'Monitor your regional mastery levels and available points.';
  } else if (pathname.startsWith('/settings')) {
    Icon = Settings;
    pageTitle = "Control Center";
    pageDescription = 'Manage your API keys and Nexus Engine parameters.';
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] dark:bg-[#1a1b1e]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Header */}
        <header className="flex justify-between items-center h-16 px-4 lg:px-8 bg-white border-b border-[#dee2e6] dark:bg-[#121212]/50 dark:border-white/5 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -mr-2 text-gray-600 hover:text-[#eb5e28] dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="lg:hidden ml-4 font-bold text-gray-800 dark:text-white uppercase tracking-wider">
              <span className="text-[#eb5e28]">GW2</span> Assist
            </span>
            
            {/* Desktop Page Title */}
            <div className="hidden lg:flex items-center gap-3">
               <div className="w-9 h-9 rounded-lg bg-cw-primary/20 border border-cw-primary/30 flex items-center justify-center shrink-0">
                 <Icon className="w-5 h-5 text-cw-primary" />
               </div>
               
               <div className="flex flex-col justify-center">
                 <h1 className="text-xl font-outfit font-bold text-white tracking-tight leading-none mb-1 mt-0.5">
                   {pageTitle}
                 </h1>
                 <span className="text-[11px] text-gray-400 leading-none font-medium">
                   {pageDescription}
                 </span>
               </div>
            </div>
          </div>

          {/* Right Side: Profile Card Area */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-white leading-none">
                {isLoading ? '...' : accountInfo?.name || 'Commander'}
              </span>
              <span className="text-[10px] text-green-500 font-bold tracking-widest uppercase mt-0.5">Online</span>
            </div>
            
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Disconnect API Key"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8f9fa] dark:bg-[#1a1b1e] p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Breadcrumbs removed as per user request */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
