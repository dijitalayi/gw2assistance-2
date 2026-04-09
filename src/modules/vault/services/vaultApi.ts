import { VaultTrack, VaultObjectiveDef, PlayerObjective } from '../types/vault';

export const fetchVaultDefinitions = async (ids: number[]): Promise<VaultObjectiveDef[]> => {
  if (ids.length === 0) return [];
  const idString = ids.join(',');
  const res = await fetch(`https://api.guildwars2.com/v2/wizardsvault/objectives?ids=${idString}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch vault definitions');
  return res.json();
};

const mergeDefinitions = async (track: VaultTrack): Promise<VaultTrack> => {
  if (!track || !track.objectives) return track;
  const ids = track.objectives.map((obj) => obj.id);
  const defs = await fetchVaultDefinitions(ids);
  
  const defMap = new Map<number, VaultObjectiveDef>();
  defs.forEach(def => defMap.set(def.id, def));

  const mergedObjectives: PlayerObjective[] = track.objectives.map(obj => {
    const def = defMap.get(obj.id);
    return {
      ...obj,
      title: def?.title,
      track: def?.track,
      acclaim: def?.acclaim,
    };
  });

  return { ...track, objectives: mergedObjectives };
};

export const fetchDailyVault = async (apiKey: string): Promise<VaultTrack> => {
  const res = await fetch(`https://api.guildwars2.com/v2/account/wizardsvault/daily?access_token=${apiKey}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch daily vault');
  const track = await res.json();
  return mergeDefinitions(track);
};

export const fetchWeeklyVault = async (apiKey: string): Promise<VaultTrack> => {
  const res = await fetch(`https://api.guildwars2.com/v2/account/wizardsvault/weekly?access_token=${apiKey}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch weekly vault');
  const track = await res.json();
  return mergeDefinitions(track);
};

export const fetchSpecialVault = async (apiKey: string): Promise<VaultTrack> => {
  const res = await fetch(`https://api.guildwars2.com/v2/account/wizardsvault/special?access_token=${apiKey}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch special vault');
  const track = await res.json();
  return mergeDefinitions(track);
};
