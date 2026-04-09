import { gw2Fetcher } from '@/services/gw2Api';

export interface CommercePrice {
  id: number;
  whitelisted: boolean;
  buys: {
    quantity: number;
    unit_price: number;
  };
  sells: {
    quantity: number;
    unit_price: number;
  };
}

export interface CommerceListing {
  id: number;
  buys: { listings: number; unit_price: number; quantity: number }[];
  sells: { listings: number; unit_price: number; quantity: number }[];
}

export interface ItemDetails {
  id: number;
  name: string;
  description?: string;
  type: string;
  level: number;
  rarity: string;
  vendor_value: number;
  icon: string;
}

export interface HistoryData {
  itemID: number;
  date: string;
  count: number;
  buy_price_avg: number;
  buy_price_max: number;
  buy_price_min: number;
  buy_price_stdev: number;
  buy_quantity_avg: number;
  buy_sold: number;
  sell_price_avg: number;
  sell_price_max: number;
  sell_price_min: number;
  sell_price_stdev: number;
  sell_quantity_avg: number;
  sell_sold: number;
  type: 'day' | 'hour';
}

export const COMMERCE_ASSETS = {
  GOLD: 'https://render.guildwars2.com/file/090A980A96D39FD36FBB004903644C6DBEFB1FFB/156904.png',
  SILVER: 'https://render.guildwars2.com/file/E5A2197D78ECE4AE0349C8B3710D033D22DB0DA6/156907.png',
  COPPER: 'https://render.guildwars2.com/file/6CF8F96A3299CFC75D5CC90617C3C70331A1EF0E/156902.png',
  GEMS: 'https://render.guildwars2.com/file/086CF7BC17BC0106A4B15F61213EDB68A2A874AB/502064.png',
};

/**
 * Fetch Item Details
 */
export const fetchItemDetails = async (id: number): Promise<ItemDetails> => {
  return gw2Fetcher<ItemDetails>({
    endpoint: `/items/${id}`,
    params: { v: 'latest' }
  });
};

/**
 * Fetch Prices with fallback
 */
export const fetchCommercePrices = async (ids: number[]): Promise<CommercePrice[]> => {
  if (ids.length === 0) return [];
  
  try {
    const chunks = [];
    for (let i = 0; i < ids.length; i += 200) {
      chunks.push(ids.slice(i, i + 200));
    }
    
    const results = await Promise.all(
      chunks.map(chunk => 
        gw2Fetcher<CommercePrice[]>({
          endpoint: '/commerce/prices',
          params: { ids: chunk.join(',') }
        }).catch(() => [])
      )
    );
    return results.flat();
  } catch (error) {
    return [];
  }
};

/**
 * Fetch Batch Listings (Depth Data: Offers, Bids)
 */
export const fetchBatchListings = async (ids: number[]): Promise<CommerceListing[]> => {
  if (ids.length === 0) return [];
  
  // Throttle to avoid hitting ANet rate limits too hard on batch
  const results = await Promise.all(
    ids.slice(0, 50).map(id => 
      gw2Fetcher<CommerceListing>({
        endpoint: `/commerce/listings/${id}`
      }).catch(() => null)
    )
  );
  return results.filter(r => r !== null) as CommerceListing[];
};

export const fetchBatchHistory = async (ids: number[]): Promise<Record<number, HistoryData & { avg_sold: number, avg_bought: number }>> => {
    const results: Record<number, HistoryData & { avg_sold: number, avg_bought: number }> = {};
    const targetIds = ids.slice(0, 20);
    
    await Promise.all(targetIds.map(async (id) => {
        try {
            const res = await fetch(`https://api.datawars2.ie/gw2/v2/history/json?itemID=${id}`);
            if (res.ok) {
                const rawData: HistoryData[] = await res.json();
                if (rawData && rawData.length > 0) {
                    // DataWars2 might return oldest first. We need newest first for volume stats.
                    const data = [...rawData].reverse(); 
                    
                    // Calculate 7-day average for volume (using the most recent 7 days)
                    const recent = data.slice(0, 7);
                    const avgSold = Math.round(recent.reduce((acc, h) => acc + (h.sell_sold || 0), 0) / recent.length);
                    const avgBought = Math.round(recent.reduce((acc, h) => acc + (h.buy_sold || 0), 0) / recent.length);
                    
                    results[id] = { 
                        ...data[0], 
                        avg_sold: avgSold, 
                        avg_bought: avgBought 
                    };
                }
            }
        } catch (e) {}
    }));
    return results;
};

/**
 * Fetch Price & Volume History from DataWars2 API (Single Item)
 */
export const fetchPriceHistory = async (itemId: number, type: 'day' | 'hour' = 'day'): Promise<HistoryData[]> => {
  const endpoint = `https://api.datawars2.ie/gw2/v2/history${type === 'hour' ? '/hourly' : ''}/json?itemID=${itemId}`;
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return [];
    const data: HistoryData[] = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
        // Return chronologically for charts (Oldest -> Newest)
        // But double check if sorting is needed. Recharts loves ascending.
        return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return [];
  } catch (error) {
    console.error('Nexus Insight Error:', error);
    return [];
  }
};

export const calculateMarketMetrics = (listing: CommerceListing) => {
  const supply = listing.sells.reduce((acc, l) => acc + l.quantity, 0);
  const demand = listing.buys.reduce((acc, l) => acc + l.quantity, 0);
  const offers = listing.sells.length;
  const bids = listing.buys.length;
  
  return { supply, demand, offers, bids };
};

export const calculateProfit = (buyPrice: number, sellPrice: number) => {
  const listingFee = Math.ceil(sellPrice * 0.05);
  const exchangeFee = Math.ceil(sellPrice * 0.10);
  const totalTax = listingFee + exchangeFee;
  const netReturn = sellPrice - totalTax;
  const profit = netReturn - buyPrice;
  const roi = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;
  
  return { netReturn, profit, totalTax, roi };
};

export const determineLiquidity = (history: HistoryData[]) => {
    if (!history || history.length === 0) return 'UNKNOWN';
    // Use the latest available day (last in chronological order)
    const recent = history[history.length - 1];
    const avgSold = recent.sell_sold || 0;
    
    if (avgSold > 5000) return 'INSTANT';
    if (avgSold > 500) return 'HIGH';
    if (avgSold > 50) return 'MODERATE';
    return 'VACUUM';
};

export const fetchCommerceListings = async (id: number): Promise<CommerceListing> => {
  return gw2Fetcher<CommerceListing>({ endpoint: `/commerce/listings/${id}` });
};

export function getRarityColor(rarity?: string): string {
  switch (rarity) {
    case 'Junk': return '#AAAAAA';
    case 'Basic': return '#EEEEEE';
    case 'Fine': return '#62A4DA';
    case 'Masterwork': return '#1a9306';
    case 'Rare': return '#fcd00b';
    case 'Exotic': return '#ffa405';
    case 'Ascended': return '#fb3e8d';
    case 'Legendary': return '#4c139d';
    default: return '#EEEEEE';
  }
}
