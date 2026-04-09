export interface AccountInfo {
  id: string;
  name: string;
  age: number;
  world: number;
  guilds: string[];
  guild_leader: string[];
  created: string;
  access: string[];
  commander: boolean;
  fractal_level: number;
  daily_ap: number;
  monthly_ap: number;
  wvw_rank: number;
  last_modified: string;
  achievement_points?: number;
  magic_find?: number;
}

export const GW2_API_BASE = 'https://api.guildwars2.com/v2';

export interface GW2FetchOptions extends RequestInit {
  endpoint: string;
  apiKey?: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Merkezi GW2 API Fetcher
 */
export async function gw2Fetcher<T>({ endpoint, apiKey, params, ...options }: GW2FetchOptions): Promise<T> {
  const url = new URL(`${GW2_API_BASE}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const headers = new Headers(options.headers || {});
  
  // Guild Wars 2 API occasionally fails CORS preflight when Authorization header is used from browser.
  // We append it to the URL directly.
  if (apiKey) {
    url.searchParams.append('access_token', apiKey);
  }

  // Hesap özel (Authenticated) istekler için caching'i tamamen kapatıyoruz.
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    cache: apiKey ? 'no-store' : options.cache || 'default',
  };

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    let errorMessage = 'Bilinmeyen GW2 API Hatası';
    try {
      const errorData = await response.json();
      errorMessage = errorData.text || errorMessage;
    } catch (e) {}
    throw new Error(`API Hatası [${endpoint}]: ${response.status} - ${errorMessage}`);
  }

  return response.json();
}

export const fetchAccountInfo = async (apiKey: string): Promise<AccountInfo> => {
  return gw2Fetcher<AccountInfo>({
    endpoint: '/account',
    apiKey,
    params: { v: 'latest' }
  });
};
