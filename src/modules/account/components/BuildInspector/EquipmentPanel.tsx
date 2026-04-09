'use client';

import React from 'react';

// GW2 rarity colors for text and UI
const RARITY_COLORS: Record<string, string> = {
  Legendary: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
  Ascended: 'text-pink-400 border-pink-500/30 bg-pink-500/5',
  Exotic: 'text-orange-400 border-orange-500/30 bg-orange-500/5',
  Rare: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
  Masterwork: 'text-green-400 border-green-500/20 bg-green-500/5',
  Fine: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
  Basic: 'text-gray-400 border-gray-500/20 bg-gray-500/5',
};

// Slot category definitions
const ARMOR_SLOTS = [
  { slot: 'Helm', label: 'Helm', icon: '🪖' },
  { slot: 'Shoulders', label: 'Shoulders', icon: '🛡️' },
  { slot: 'Coat', label: 'Coat', icon: '🧥' },
  { slot: 'Gloves', label: 'Gloves', icon: '🧤' },
  { slot: 'Leggings', label: 'Leggings', icon: '👖' },
  { slot: 'Boots', label: 'Boots', icon: '👢' },
];

const WEAPON_SLOTS = [
  { slot: 'WeaponA1', label: 'Weapon 1A', icon: '⚔️' },
  { slot: 'WeaponA2', label: 'Weapon 1B', icon: '🗡️' },
  { slot: 'WeaponB1', label: 'Weapon 2A', icon: '⚔️' },
  { slot: 'WeaponB2', label: 'Weapon 2B', icon: '🗡️' },
];

const TRINKET_SLOTS = [
  { slot: 'Backpack', label: 'Backpack', icon: '🎒' },
  { slot: 'Accessory1', label: 'Accessory 1', icon: '💎' },
  { slot: 'Accessory2', label: 'Accessory 2', icon: '💎' },
  { slot: 'Amulet', label: 'Amulet', icon: '📿' },
  { slot: 'Ring1', label: 'Ring 1', icon: '💍' },
  { slot: 'Ring2', label: 'Ring 2', icon: '💍' },
];

interface EquipmentItem {
  id: number;
  slot: string;
  stats?: { id: number };
  upgrades?: number[];
  infusions?: number[];
}

interface EquipmentPanelProps {
  equipment: EquipmentItem[];
  itemMetadata?: any[]; // The deep fetched items
}

function EquipmentSlot({ label, icon, item, meta }: {
  label: string;
  icon: string;
  item?: EquipmentItem;
  meta?: any;
}) {
  const rarityClass = meta?.rarity ? RARITY_COLORS[meta.rarity] : 'border-white/5 opacity-40';

  if (!item) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-black/20 opacity-30">
        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-lg text-gray-700">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{label}</span>
          <span className="text-xs text-gray-700 italic">Empty Slot</span>
        </div>
      </div>
    );
  }

  // Tooltip attributes for armory-embeds
  const upgradesAttr = item.upgrades?.length ? { [`data-armory-${item.id}-upgrades`]: item.upgrades.join(',') } : {};
  const statAttr = item.stats?.id ? { [`data-armory-${item.id}-stat`]: item.stats.id } : {};
  const infusionAttr = item.infusions?.length ? { [`data-armory-${item.id}-infusions`]: item.infusions.join(',') } : {};

  const allAttrs = {
    'data-armory-embed': 'items',
    'data-armory-ids': String(item.id),
    'data-armory-size': '44',
    ...upgradesAttr,
    ...statAttr,
    ...infusionAttr,
  } as Record<string, string>;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group ${rarityClass}`}>
      <div className="relative flex-shrink-0">
        <div {...allAttrs} className="rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{label}</span>
        <span className={`text-xs font-black truncate leading-tight ${rarityClass.split(' ')[0]}`}>
          {meta?.name || 'Loading item...'}
        </span>
        {meta?.rarity && (
          <span className="text-[9px] text-gray-600 font-medium uppercase tracking-tighter">
            {meta.rarity}
          </span>
        )}
      </div>
    </div>
  );
}

export function EquipmentPanel({ equipment, itemMetadata = [] }: EquipmentPanelProps) {
  const getItemData = (slot: string) => {
    const item = equipment.find(e => e.slot === slot);
    const meta = item ? itemMetadata.find(m => m.id === item.id) : null;
    return { item, meta };
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Armor Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#eb5e28] mb-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full border-2 border-[#eb5e28]" />
          Armor
          <div className="h-px flex-1 bg-gradient-to-r from-[#eb5e28]/20 to-transparent" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ARMOR_SLOTS.map(({ slot, label, icon }) => {
            const { item, meta } = getItemData(slot);
            return <EquipmentSlot key={slot} label={label} icon={icon} item={item} meta={meta} />;
          })}
        </div>
      </div>

      {/* Weapons Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#eb5e28] mb-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full border-2 border-[#eb5e28]" />
          Weapons
          <div className="h-px flex-1 bg-gradient-to-r from-[#eb5e28]/20 to-transparent" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WEAPON_SLOTS.map(({ slot, label, icon }) => {
            const { item, meta } = getItemData(slot);
            return <EquipmentSlot key={slot} label={label} icon={icon} item={item} meta={meta} />;
          })}
        </div>
      </div>

      {/* Trinkets Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#eb5e28] mb-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full border-2 border-[#eb5e28]" />
          Trinkets
          <div className="h-px flex-1 bg-gradient-to-r from-[#eb5e28]/20 to-transparent" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRINKET_SLOTS.map(({ slot, label, icon }) => {
            const { item, meta } = getItemData(slot);
            return <EquipmentSlot key={slot} label={label} icon={icon} item={item} meta={meta} />;
          })}
        </div>
      </div>
    </div>
  );
}
