'use client';

/**
 * NEXUS ENGINE v8.6 - UNLIMITED RADAR
 * Implementing insights from gw2po.min.js analysis.
 * Full index coverage + Live name hydration.
 */

export interface CompactItem {
    id: number;
    name: string;
    cat: string;
}

class MarketSyncService {
    private DB_NAME = 'NexusMarketDB';
    private STORE_NAME = 'market_index';
    private index: CompactItem[] = [];
    private isSyncing = false;
    private totalResults = 0;

    private CORE_ASSETS: CompactItem[] = [
        { id: 19684, name: 'Mystic Coin', cat: 'Trophy' },
        { id: 19721, name: 'Glob of Ectoplasm', cat: 'Trophy' },
        { id: 20317, name: 'Heavy Bag of Coins', cat: 'Container' },
        { id: 8936, name: 'Leather Bag', cat: 'Container' },
        { id: 68361, name: 'Elder Wood Logging Node', cat: 'UpgradeComponent' },
        { id: 68362, name: 'Ancient Wood Logging Node', cat: 'UpgradeComponent' },
        { id: 68363, name: 'Hard Wood Logging Node', cat: 'UpgradeComponent' },
        { id: 9574, name: '20 Slot Invisible Bag', cat: 'Container' }
    ];

    constructor() {
        console.log('--- Market Engine v1.0 Initialized ---');
        if (typeof window !== 'undefined') {
            this.loadFromIndexedDB();
        }
    }

    private async loadFromIndexedDB() {
        try {
            const db = await this.openDB();
            const tx = db.transaction(this.STORE_NAME, 'readonly');
            const store = tx.objectStore(this.STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                if (request.result?.length > 100) this.index = request.result;
                else this.index = [...this.CORE_ASSETS];
            };
        } catch (e) {
            this.index = [...this.CORE_ASSETS];
        }
    }

    private async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    public getProgress() { return this.progress; }
    public isBusy() { return this.isSyncing; }
    public getTotalCount() { return this.totalResults || this.index.length; }

    public async initIndex(force = false) {
        if (this.isSyncing) return;
        if (this.index.length > 24000 && !force) return;

        this.isSyncing = true;
        try {
            const discRes = await fetch('https://api.guildwars2.com/v2/commerce/prices');
            const allTradeableIds: number[] = await discRes.json();
            this.totalResults = allTradeableIds.length;
            
            const chunks = [];
            for (let i = 0; i < allTradeableIds.length; i += 200) {
                chunks.push(allTradeableIds.slice(i, i + 200));
            }

            const freshIndex: CompactItem[] = [...this.index];
            const PARALLEL_SIZE = 15; 

            for (let i = 0; i < chunks.length; i += PARALLEL_SIZE) {
                const currentChunks = chunks.slice(i, i + PARALLEL_SIZE);
                await Promise.all(currentChunks.map(async (chunk) => {
                    const res = await fetch(`https://api.guildwars2.com/v2/items?ids=${chunk.join(',')}&lang=en`);
                    if (res.ok) {
                        const items = await res.json();
                        items.forEach((item: any) => {
                            const idx = freshIndex.findIndex(f => f.id === item.id);
                            if (idx > -1) {
                                if (freshIndex[idx].name.startsWith('Item') || !freshIndex[idx].name) {
                                    freshIndex[idx].name = item.name;
                                    freshIndex[idx].cat = item.type;
                                }
                            } else {
                                freshIndex.push({ id: item.id, name: item.name, cat: item.type });
                            }
                        });
                    }
                }));
                this.index = [...freshIndex]; 
            }

            const db = await this.openDB();
            const tx = db.transaction(this.STORE_NAME, 'readwrite');
            const store = tx.objectStore(this.STORE_NAME);
            freshIndex.forEach(item => store.put(item));
        } catch (error) {
            console.error('Nexus v8.6 Error:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    public search(query: string, category: string = 'All'): CompactItem[] {
        if (!query) return this.getCategoryItems(category);
        const q = query.toLowerCase();
        
        // Return MORE items for analysis (up to 1000)
        const results = this.index.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(q);
            const catMatch = category === 'All' || item.cat === category;
            return nameMatch && catMatch;
        });

        return results.sort((a, b) => {
            if (a.name.toLowerCase() === q) return -1;
            if (b.name.toLowerCase() === q) return 1;
            // Heavy Bag of Coins priority logic similar to gw2bltc sorting
            if (a.name.includes('Heavy Bag')) return -1;
            if (b.name.includes('Heavy Bag')) return 1;
            return a.name.length - b.name.length;
        }).slice(0, 1000); 
    }

    public getItemName(id: number): string {
        return this.index.find(i => i.id === id)?.name || `Item ${id}`;
    }

    public getCategoryItems(category: string): CompactItem[] {
        return this.index
            .filter(item => category === 'All' || item.cat === category)
            .slice(0, 50);
    }
}

export const marketSync = new MarketSyncService();
