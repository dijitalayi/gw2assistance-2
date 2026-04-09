import { gw2Fetcher } from '@/services/gw2Api';

export interface MaterialCategory {
  id: number;
  name: string;
  order: number;
}

export interface MaterialItem {
  id: number;
  category: number;
  binding: string;
  count: number;
}

export interface ItemDef {
  id: number;
  name: string;
  description: string;
  type: string;
  level: number;
  rarity: string;
  icon: string;
}

export const fetchMaterialCategories = async (): Promise<MaterialCategory[]> => {
  return gw2Fetcher<MaterialCategory[]>({
    endpoint: '/materials',
    params: { ids: 'all' }
  });
};

export interface BankItem {
  id: number;
  count: number;
  charges?: number;
  skin?: number;
  upgrades?: number[];
  infusions?: number[];
  binding?: string;
}

export interface InventoryBag {
  id: number;
  size: number;
  inventory: BankItem[];
}

export const fetchMaterialStorage = async (apiKey: string): Promise<MaterialItem[]> => {
  return gw2Fetcher<MaterialItem[]>({
    endpoint: '/account/materials',
    apiKey
  });
};

export const fetchBank = async (apiKey: string): Promise<BankItem[]> => {
  return gw2Fetcher<BankItem[]>({
    endpoint: '/account/bank',
    apiKey
  });
};

export const fetchCharacterBags = async (apiKey: string, character: string): Promise<{ bags: (InventoryBag | null)[] }> => {
  return gw2Fetcher<{ bags: (InventoryBag | null)[] }>({
    endpoint: `/characters/${encodeURIComponent(character)}`,
    apiKey
  });
};

export const fetchItemDefinitions = async (ids: number[]): Promise<ItemDef[]> => {
  if (ids.length === 0) return [];
  
  const chunkSize = 200;
  const chunks: number[][] = [];
  
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const idString = chunk.join(',');
      try {
        return await gw2Fetcher<ItemDef[]>({
          endpoint: '/items',
          params: { ids: idString }
        });
      } catch (err) {
        console.error("Error fetching chunk of items:", err);
        return [];
      }
    })
  );

  return results.flat();
};
