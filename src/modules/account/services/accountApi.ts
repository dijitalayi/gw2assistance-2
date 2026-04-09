import { gw2Fetcher } from '@/services/gw2Api';

export interface CharacterCore {
  name: string;
  race: string;
  gender: string;
  profession: string;
  level: number;
  guild?: string;
  age: number;
  created: string;
  deaths: number;
  title?: number;
}

export interface Character extends CharacterCore {
  title?: number;
  backstory?: string[];
  attributes?: Record<string, number>;
  equipment?: {
    id: number;
    slot: string;
    infusions?: number[];
    upgrades?: number[];
    skin?: number;
    stats?: {
      id: number;
      attributes: Record<string, number>;
    };
    binding?: string;
    bound_to?: string;
  }[];
  specializations?: {
    pve?: { id: number; traits: (number | null)[] }[];
    pvp?: { id: number; traits: (number | null)[] }[];
    wvw?: { id: number; traits: (number | null)[] }[];
  };
  skills?: {
    pve?: { heal: number; utilities: number[]; elite: number };
    pvp?: { heal: number; utilities: number[]; elite: number };
    wvw?: { heal: number; utilities: number[]; elite: number };
  };
  equipment_tabs?: {
    tab: number;
    name: string;
    is_active: boolean;
    equipment: any[];
    metadata?: any;
  }[];
  active_equipment_tab?: number;
  build_tabs?: {
    tab: number;
    is_active: boolean;
    build: {
      specializations: { id: number; traits: (number | null)[] }[];
      skills: {
        heal: number;
        utilities: number[];
        elite: number;
      };
      legends?: string[]; // Revenant specific
      pet_names?: string[]; // Ranger specific
    };
  }[];
  active_build_tab?: number;
  crafting?: {
    discipline: string;
    rating: number;
    active: boolean;
  }[];
}

export interface CurrencyValue {
  id: number;
  value: number;
}

export interface CurrencyDef {
  id: number;
  name: string;
  description: string;
  order: number;
  icon: string;
}

export const fetchCharacters = async (apiKey: string): Promise<Character[]> => {
  return gw2Fetcher<Character[]>({
    endpoint: '/characters',
    apiKey,
    params: { ids: 'all' }
  });
};

export const fetchWallet = async (apiKey: string): Promise<CurrencyValue[]> => {
  return gw2Fetcher<CurrencyValue[]>({
    endpoint: '/account/wallet',
    apiKey
  });
};

export const fetchCharacterDetails = async (apiKey: string, name: string): Promise<Character> => {
  return gw2Fetcher<Character>({
    endpoint: `/characters/${encodeURIComponent(name)}`,
    apiKey,
    params: { v: '2022-03-23' }
  });
};

// Bulk fetch items (ids array)
export interface ItemDef {
  id: number;
  name: string;
  icon: string;
  rarity: string;
  type: string;
  level: number;
  flags?: string[];
  details?: any;
}
export const fetchItems = async (ids: number[]): Promise<ItemDef[]> => {
  if (ids.length === 0) return [];
  
  const chunkSize = 200;
  const chunks = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }

  try {
    const promises = chunks.map(chunk => 
      gw2Fetcher<ItemDef[]>({
        endpoint: '/items',
        params: { ids: chunk.join(',') }
      })
    );
    
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
};

// Bulk fetch item stats (ids array)
export interface ItemStatDef {
  id: number;
  attributes: Record<string, number>;
}
export const fetchItemStats = async (ids: number[]): Promise<ItemStatDef[]> => {
  if (ids.length === 0) return [];
  const idString = ids.join(',');
  return gw2Fetcher<ItemStatDef[]>({
    endpoint: '/itemstats',
    params: { ids: idString }
  });
};

export const fetchCurrenciesInfo = async (ids: number[]): Promise<CurrencyDef[]> => {
  if (ids.length === 0) return [];
  const idString = ids.join(',');
  return gw2Fetcher<CurrencyDef[]>({
    endpoint: '/currencies',
    params: { ids: idString }
  });
};

export interface ProfessionDef {
  id: string;
  name: string;
  icon: string;
  icon_big: string;
}

export interface SpecializationDef {
  id: number;
  name: string;
  profession: string;
  elite: boolean;
  icon: string;
  profession_icon_big?: string;
}

export const fetchProfessions = async (): Promise<ProfessionDef[]> => {
  return gw2Fetcher<ProfessionDef[]>({
    endpoint: '/professions',
    params: { ids: 'all' }
  });
};

export const fetchSpecializations = async (): Promise<SpecializationDef[]> => {
  return gw2Fetcher<SpecializationDef[]>({
    endpoint: '/specializations',
    params: { ids: 'all' }
  });
};

export const fetchTitles = async (ids: number[]): Promise<{ id: number; name: string }[]> => {
  if (ids.length === 0) return [];
  const idString = ids.join(',');
  return gw2Fetcher<{ id: number; name: string }[]>({
    endpoint: '/titles',
    params: { ids: idString }
  });
};

export interface GuildDef {
  id: string;
  name: string;
  tag: string;
  emblem?: any;
}

export const fetchGuild = async (id: string): Promise<GuildDef> => {
  return gw2Fetcher<GuildDef>({
    endpoint: `/guild/${id}`
  });
};

export interface AccountLuck {
  id: string;
  value: number;
}

export const fetchAccountLuck = async (apiKey: string): Promise<AccountLuck[]> => {
  return gw2Fetcher<AccountLuck[]>({
    endpoint: '/account/luck',
    apiKey
  });
};

/**
 * AP miktarına göre hesap bonuslarını hesaplar.
 * Tahmini: Her 500 AP bir sandık ve her sandık %1 bonus.
 */
export const calculateAPBonuses = (ap: number) => {
  const chests = Math.floor(ap / 500);
  return {
    goldFind: Math.min(30, chests),
    karmaGain: Math.min(50, chests),
    magicFind: chests,
    xpGain: Math.min(30, chests), // XP Gain also comes from chests
    nextReward: (chests + 1) * 500
  };
};


export interface MasteryPointsResponse {
  totals: { region: string; spent: number; earned: number }[];
}

export const fetchMasteryPoints = async (apiKey: string): Promise<MasteryPointsResponse> => {
  return gw2Fetcher<MasteryPointsResponse>({
    endpoint: '/account/mastery/points',
    apiKey
  });
};



export interface TPTransaction {
  id: number;
  item_id: number;
  price: number;
  quantity: number;
  created: string;
  purchased?: string; // history only
}

export interface AchievementProgress {
  id: number;
  current: number;
  max: number;
  done: boolean;
  bits?: number[];
  repeated?: number;
}

export interface AchievementDef {
  id: number;
  name: string;
  description: string;
  requirement: string;
  locked_text: string;
  type: string;
  flags: string[];
  tiers: { count: number; points: number }[];
  rewards?: { type: string; id?: number; count?: number; region?: string }[];
  bits?: { type: string; id?: number; text?: string }[];
  icon?: string;
}

export interface AchievementCategoryDef {
  id: number;
  name: string;
  description: string;
  order: number;
  icon: string;
  achievements: number[];
}

export interface AchievementGroupDef {
  id: string;
  name: string;
  description: string;
  order: number;
  categories: number[];
}

// Fixed Asset Icons (Stable Wiki URLs for 2026)
export const ASSETS = {
  AP: "https://render.guildwars2.com/file/6631174867B0D6BC62EE3B3BFF2669336DDAE4DA/866106.png",
  LUCK: "https://render.guildwars2.com/file/DAB46301D2175B2CAAC4BACBA02F6A0A2F1DBEB8/631151.png",
  CHEST: "https://render.guildwars2.com/file/0946149B43355E23B5C7552E6E5DDB4A9160603E/603242.png",
  GOLD_FIND: "https://wiki.guildwars2.com/images/4/47/Gold_Find.png",
  KARMA: "https://wiki.guildwars2.com/images/4/44/Karma_Gain.png",
  MAGIC_FIND: "https://wiki.guildwars2.com/images/9/94/Magic_Find_%28account_bonus%29.png",
  XP_GAIN: "https://wiki.guildwars2.com/images/d/d0/XP_Gain.png"
};

export interface MasteryDef {
  id: number;
  name: string;
  description: string;
  region: string;
  levels: { 
    name: string; 
    description: string; 
    instruction: string; 
    icon: string; 
    point_cost: number; 
    exp_cost: number 
  }[];
}

export const fetchTPTransactions = async (
  apiKey: string, 
  type: 'buys' | 'sells', 
  status: 'current' | 'history'
): Promise<TPTransaction[]> => {
  return gw2Fetcher<TPTransaction[]>({
    endpoint: `/commerce/transactions/${status}/${type}`,
    apiKey
  });
};

export const fetchAccountAchievements = async (apiKey: string): Promise<AchievementProgress[]> => {
  return gw2Fetcher<AchievementProgress[]>({
    endpoint: '/account/achievements',
    apiKey
  });
};

export const fetchAchievementsInfo = async (ids: number[]): Promise<AchievementDef[]> => {
  if (ids.length === 0) return [];
  
  const chunkSize = 200;
  const chunks = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }

  try {
    const promises = chunks.map(chunk => 
      gw2Fetcher<AchievementDef[]>({
        endpoint: '/achievements',
        params: { ids: chunk.join(',') }
      })
    );
    
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error('Error fetching achievements info:', error);
    return [];
  }
};

export const fetchAchievementCategories = async (ids: 'all' | number[] = 'all'): Promise<AchievementCategoryDef[]> => {
  return gw2Fetcher<AchievementCategoryDef[]>({
    endpoint: '/achievements/categories',
    params: { ids: Array.isArray(ids) ? ids.join(',') : ids }
  });
};

export const fetchAchievementGroups = async (): Promise<AchievementGroupDef[]> => {
  return gw2Fetcher<AchievementGroupDef[]>({
    endpoint: '/achievements/groups',
    params: { ids: 'all' }
  });
};

export const fetchAccountMasteries = async (apiKey: string): Promise<{ id: number; level: number }[]> => {
  return gw2Fetcher<{ id: number; level: number }[]>({
    endpoint: '/account/masteries',
    apiKey
  });
};

export const fetchMasteriesInfo = async (): Promise<MasteryDef[]> => {
  return gw2Fetcher<MasteryDef[]>({
    endpoint: '/masteries',
    params: { ids: 'all' }
  });
};
