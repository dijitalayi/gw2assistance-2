'use client';

import React, { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle, Shield, Target } from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';
import {
  fetchCharacterDetails,
  fetchSpecializations,
  fetchTitles,
  fetchGuild,
  fetchMasteryPoints,
  fetchItems
} from '@/modules/account/services/accountApi';

import { fetchAccountInfo } from '@/services/gw2Api';
import { CharacterHero } from '@/modules/account/components/BuildInspector/CharacterHero';
import { EquipmentPanel } from '@/modules/account/components/BuildInspector/EquipmentPanel';
import { StatsPanel, type CharacterStats } from '@/modules/account/components/BuildInspector/StatsPanel';
import { TraitsPanel } from '@/modules/account/components/BuildInspector/TraitsPanel';
import { SkillsPanel } from '@/modules/account/components/BuildInspector/SkillsPanel';
import { ArmoryEmbedsUpdater } from '@/modules/account/components/BuildInspector/ArmoryLoader';

/**
 * GW2 Seviye Bazlı Taban Özellik Hesaplayıcı
 */
function getBaseAttribute(level: number): number {
  if (level >= 80) return 1000;
  if (level <= 1) return 37;
  return Math.floor(37 + Math.pow(level / 80, 1.5) * (1000 - 37));
}

/**
 * Metin bazlı stat bonuslarını ayıklar (Rünler/Sigiller için)
 * Örn: "+25 Power", "+50 Vitality"
 */
function parseTextBonuses(bonuses: string[]): Record<string, number> {
  const extracted: Record<string, number> = {};
  if (!bonuses) return extracted;

  const regex = /\+?(\d+)\s+([a-zA-Z ]+)/;

  bonuses.forEach(line => {
    const match = line.match(regex);
    if (match) {
      const val = parseInt(match[1], 10);
      const attr = match[2].trim();
      const targetKey = mapAttributeName(attr);
      extracted[targetKey] = (extracted[targetKey] || 0) + val;
    }
  });

  return extracted;
}

function resolveEffectiveStats(character: any, itemMetadata: any[]): CharacterStats {
  const level = character?.level || 80;
  const base = getBaseAttribute(level);

  const stats: any = {
    Power: base,
    Precision: base,
    Toughness: base,
    Vitality: base,
    Ferocity: 0,
    'Healing Power': 0,
    'Condition Damage': 0,
    Expertise: 0,
    Concentration: 0,
    'Agony Resistance': 0
  };

  const activeTabId = character?.active_equipment_tab;
  const tab = character?.equipment_tabs?.find((t: any) => t.tab === activeTabId);
  const equipment = tab?.equipment || character?.equipment || [];

  equipment.forEach((equipItem: any) => {
    // 1. Seçilebilir Statlar (Character object içindeki stats alanı)
    if (equipItem.stats?.attributes) {
      Object.entries(equipItem.stats.attributes).forEach(([key, val]) => {
        const targetKey = mapAttributeName(key);
        if (stats[targetKey] !== undefined) {
          stats[targetKey] += (val as number);
        } else {
          stats[targetKey] = (val as number);
        }
      });
    }

    // 2. Sabit Statlar ve Bonuslar (Item Metadata üzerinden)
    const relatedIds = [
      equipItem.id,
      ...(equipItem.infusions || []),
      ...(equipItem.upgrades || [])
    ];

    relatedIds.forEach(id => {
      const meta = itemMetadata.find(m => m.id === id);
      if (!meta) return;

      // A. Standart Tablolu Statlar
      if (meta.details?.infix_upgrade?.attributes) {
        meta.details.infix_upgrade.attributes.forEach((attr: any) => {
          const targetKey = mapAttributeName(attr.attribute);
          if (stats[targetKey] !== undefined) {
            stats[targetKey] += (attr.modifier as number);
          } else {
            stats[targetKey] = (attr.modifier as number);
          }
        });
      }

      // B. Metin Bazlı Rün/Sigil Bonusları (Kritik: Vitality vb buradadır)
      if (meta.details?.bonuses) {
        const textStats = parseTextBonuses(meta.details.bonuses);
        Object.entries(textStats).forEach(([key, val]) => {
          if (stats[key] !== undefined) {
            stats[key] += val;
          } else {
            stats[key] = val;
          }
        });
      }
    });
  });

  return stats;
}

function mapAttributeName(name: string): string {
  const mapping: Record<string, string> = {
    'CritDamage': 'Ferocity',
    'Healing': 'Healing Power',
    'HealingPower': 'Healing Power',
    'ConditionDamage': 'Condition Damage',
    'ConditionDuration': 'Expertise',
    'BoonDuration': 'Concentration',
    'AgonyResistance': 'Agony Resistance',
    'Healing Power': 'Healing Power',
    'Condition Damage': 'Condition Damage'
  };
  return mapping[name] || name;
}

// Aktif Build Çözümleme
function resolveActiveBuild(character: any) {
  const activeTabIdx = character?.active_build_tab ?? 0;
  const activeTab = character?.build_tabs?.[activeTabIdx - 1] || character?.build_tabs?.[0];
  return activeTab?.build;
}

export default function CharacterDetailsPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const charName = decodeURIComponent(resolvedParams.name);
  const { apiKey } = useAuth();

  const { data: character, isLoading: isCharLoading, isError: isCharError } = useQuery({
    queryKey: ['character-detail', charName, apiKey],
    queryFn: () => fetchCharacterDetails(apiKey!, charName),
    enabled: !!apiKey,
  });

  const equipmentIds = React.useMemo(() => {
    if (!character) return [];
    const activeTabId = character.active_equipment_tab;
    const tab = character.equipment_tabs?.find((t: any) => t.tab === activeTabId);
    const equipment = tab?.equipment || character.equipment || [];

    const ids = new Set<number>();
    equipment.forEach((item: any) => {
      if (item.id) ids.add(item.id);
      if (item.infusions) item.infusions.forEach((id: number) => ids.add(id));
      if (item.upgrades) item.upgrades.forEach((id: number) => ids.add(id));
    });
    return Array.from(ids);
  }, [character]);

  const { data: itemMetadata, isLoading: isItemsLoading } = useQuery({
    queryKey: ['items-metadata', equipmentIds],
    queryFn: () => fetchItems(equipmentIds),
    enabled: equipmentIds.length > 0,
    staleTime: 1000 * 60 * 60,
  });

  const { data: specializations } = useQuery({
    queryKey: ['specializations'],
    queryFn: fetchSpecializations,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const { data: titleData } = useQuery({
    queryKey: ['title', character?.title],
    queryFn: () => fetchTitles([character!.title!]),
    enabled: !!character?.title,
  });

  const { data: guildData } = useQuery({
    queryKey: ['guild', character?.guild],
    queryFn: () => fetchGuild(character!.guild!),
    enabled: !!character?.guild,
  });

  const { data: accountInfo } = useQuery({
    queryKey: ['account', apiKey],
    queryFn: () => fetchAccountInfo(apiKey!),
    enabled: !!apiKey,
  });

  const { data: masteryPoints } = useQuery({
    queryKey: ['mastery-points', apiKey],
    queryFn: () => fetchMasteryPoints(apiKey!),
    enabled: !!apiKey,
  });

  if (!apiKey) return <div className="flex items-center justify-center min-h-screen">API Key Missing.</div>;

  const isLoading = isCharLoading || (equipmentIds.length > 0 && isItemsLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#eb5e28]" />
        <p className="text-gray-400 font-outfit uppercase tracking-widest">Analyzing {charName}...</p>
      </div>
    );
  }

  if (isCharError || !character) return <div className="p-8 text-center text-red-500">Error: Could not retrieve character data.</div>;

  const activeBuild = resolveActiveBuild(character);
  const totalMastery = masteryPoints?.totals?.reduce((acc: number, curr: any) => acc + curr.earned, 0);
  const activeTitle = titleData?.[0]?.name;
  const effectiveStats = resolveEffectiveStats(character, itemMetadata || []);

  let eliteSpecName: string | undefined;
  let eliteSpecIcon: string | undefined;

  if (activeBuild && specializations) {
    const buildSpecs = activeBuild.specializations || [];
    for (const specRef of buildSpecs) {
      if (!specRef) continue;
      const specDef = specializations.find(s => s.id === specRef.id);
      if (specDef?.elite) {
        eliteSpecName = specDef.name;
        eliteSpecIcon = `https://wiki.guildwars2.com/wiki/Special:FilePath/${encodeURIComponent(specDef.name + '_icon_(highres).png')}`;
        break;
      }
    }
  }

  return (
    <div className="min-h-screen w-full p-4 lg:p-8 text-white flex flex-col gap-6">
      <ArmoryEmbedsUpdater isReady={!isLoading && !!character} />

      <div className="flex items-center justify-between">
        <Link href="/account/characters" className="group flex items-center text-gray-400 hover:text-[#eb5e28] transition-all text-xs font-bold uppercase tracking-widest">
          <div className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center mr-3 group-hover:border-[#eb5e28]/50 group-hover:bg-[#eb5e28]/5 transition-all text-[#eb5e28]">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Characters
        </Link>
      </div>

      <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        <CharacterHero
          name={character.name}
          level={character.level}
          race={character.race}
          gender={character.gender}
          profession={character.profession}
          deaths={character.deaths}
          age={character.age}
          eliteSpecName={eliteSpecName}
          eliteSpecIcon={eliteSpecIcon}
          guildTag={guildData ? `[${guildData.tag}] ${guildData.name}` : undefined}
          titleName={activeTitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="bg-[#161616]/60 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#eb5e28] mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#eb5e28]" />
                Character Equipment
              </h2>
              <EquipmentPanel equipment={character.equipment || []} itemMetadata={itemMetadata} />
            </div>

            <div className="bg-[#161616]/60 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#eb5e28] mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#eb5e28]" />
                Utility Skills
              </h2>
              <SkillsPanel skills={activeBuild?.skills} />
            </div>

            <div className="bg-[#161616]/60 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#eb5e28] mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#eb5e28]" />
                Specializations & Traits
              </h2>
              <TraitsPanel specializations={activeBuild?.specializations} />
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-8">
            <StatsPanel
              stats={effectiveStats}
              crafting={character.crafting}
              titleName={activeTitle}
              achievementPoints={accountInfo?.achievement_points}
              masteryPoints={totalMastery}
              wvwRank={accountInfo?.wvw_rank}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
