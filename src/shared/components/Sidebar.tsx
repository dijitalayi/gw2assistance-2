"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Map, 
  Users, 
  ShoppingBag, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  Layers,
  Calendar,
  Backpack
} from 'lucide-react';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: { name: string; href: string }[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Live Map', href: '/map', icon: Map },
  { name: "Wizard's Vault", href: '/vault', icon: Layers },
  { name: "Event Timers", href: '/events', icon: Calendar },
  {
    name: 'Account',
    icon: Users,
    subItems: [
      { name: 'Characters', href: '/account/characters' },
      { name: 'Inventory & Bank', href: '/account/inventory' },
      { name: 'Achievements', href: '/account/achievements' },
      { name: 'Masteries', href: '/account/masteries' },
    ],
  },
  {
    name: 'Trading Post',
    icon: ShoppingBag,
    subItems: [
      { name: 'Transactions', href: '/account/trading-post' },
      { name: 'Market Analysis', href: '/account/trading-post/market' },
    ],
  },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const isRouteActive = (href?: string) => href === pathname;
  const isSubRouteActive = (subItems?: { href: string }[]) => 
    subItems?.some(item => pathname.startsWith(item.href)) || false;

  const renderNavItems = () => {
    return navItems.map((item) => {
      const isActive = isRouteActive(item.href) || isSubRouteActive(item.subItems);
      const isExpanded = expandedItems[item.name];

      return (
        <div key={item.name} className="flex flex-col mb-1">
          {item.subItems ? (
            <button
              onClick={() => toggleExpand(item.name)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors
                ${isActive ? 'text-[#eb5e28] bg-[#eb5e28]/10' : 'text-gray-300 hover:bg-[#eb5e28]/10 hover:text-[#eb5e28]'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <Link
              href={item.href || '#'}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isRouteActive(item.href) ? 'text-[#eb5e28] bg-[#eb5e28]/10' : 'text-gray-300 hover:bg-[#eb5e28]/10 hover:text-[#eb5e28]'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )}

          {item.subItems && isExpanded && (
            <div className="flex flex-col mt-1 ml-9 pl-3 border-l border-[#495057] gap-1">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className={`text-sm p-2 rounded-lg transition-colors
                    ${isRouteActive(subItem.href) ? 'text-[#eb5e28] font-medium' : 'text-gray-400 hover:text-[#eb5e28] hover:bg-[#eb5e28]/5'}
                  `}
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#212529] border-r border-[#343a40]
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6">
          <h1 className="text-xl font-bold text-white tracking-widest uppercase">
            <span className="text-[#eb5e28]">GW2</span> Assist
          </h1>
          <button className="lg:hidden text-gray-300 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
          {renderNavItems()}
        </nav>

        <div className="p-4 border-t border-[#343a40]">
          <div className="text-xs text-gray-500 text-center">
            GW2 Assistant v0.1.0
          </div>
        </div>
      </aside>
    </>
  );
}
