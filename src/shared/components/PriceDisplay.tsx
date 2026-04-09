'use client';

import React from 'react';

interface PriceDisplayProps {
  coins: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Global olarak tanımladığımız resmi render ikonları
const COMMERCE_ICONS = {
  GOLD: 'https://render.guildwars2.com/file/090A980A96D39FD36FBB004903644C6DBEFB1FFB/156904.png',
  SILVER: 'https://render.guildwars2.com/file/E5A2197D78ECE4AE0349C8B3710D033D22DB0DA6/156907.png',
  COPPER: 'https://render.guildwars2.com/file/6CF8F96A3299CFC75D5CC90617C3C70331A1EF0E/156902.png'
};

export function PriceDisplay({ coins, size = 'md', className = '' }: PriceDisplayProps) {
  const actualCoins = Math.max(0, coins || 0);
  
  const gold = Math.floor(actualCoins / 10000);
  const silver = Math.floor((actualCoins % 10000) / 100);
  const copper = Math.floor(actualCoins % 100);

  const sizeClasses = {
    sm: 'text-[11px] gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-xl gap-2 font-black'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const renderPart = (val: number, icon: string, colorClass: string) => {
    if (val <= 0 && icon !== COMMERCE_ICONS.COPPER) return null;
    // Bakır her zaman görünür olmalı (değer 0 olsa bile sadece o görünür)
    if (val <= 0 && icon === COMMERCE_ICONS.COPPER && (gold > 0 || silver > 0)) return null;

    return (
      <div className={`flex items-center gap-0.5 ${colorClass}`}>
        <span className="tabular-nums">{val.toLocaleString('en-US')}</span>
        <img src={icon} className={`${iconSizes[size]} object-contain`} alt="" />
      </div>
    );
  };

  return (
    <div className={`flex items-center font-mono tracking-tight leading-none ${sizeClasses[size]} ${className}`}>
        {gold > 0 && renderPart(gold, COMMERCE_ICONS.GOLD, 'text-yellow-400')}
        {silver > 0 && renderPart(silver, COMMERCE_ICONS.SILVER, 'text-gray-300')}
        {(copper >= 0 || (gold === 0 && silver === 0)) && renderPart(copper, COMMERCE_ICONS.COPPER, 'text-[#eb5e28]')}
    </div>
  );
}
