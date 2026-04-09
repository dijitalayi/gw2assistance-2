import { useState, useEffect, useMemo } from 'react';
import eventsConfig from '../data/events.json';
import { GW2EventConfig } from '../types/event';
import { generateOccurrences, EventOccurrence, getEventStatus } from '../utils/timerUtils';

const ROW_ORDER = [
  "Day And Night",
  "World Bosses",
  "Hard World Bosses",
  "Ley-Line Anomaly",
  "Invasions",
  "Fractal Incursions",
  "EU PvP Tournaments",
  "NA PvP Tournaments",
  "Living World Season 2",
  "Heart of Thorns",
  "Living World Season 3",
  "Path of Fire",
  "Living World Season 4",
  "The Icebrood Saga",
  "End of Dragons",
  "Secrets of the Obscure",
  "Janthir Wilds",
  "Visions of Eternity",
  "Convergence",
  "Public Instances (Eye of the North)",
  "Special Events (Labyrinthine Cliffs)",
  "Dragon Bash",
  "Halloween"
];

function getEventRowTitle(config: GW2EventConfig): string {
  const name = config.name;
  const cat = config.category;
  const dif = config.difficulty;
  const loc = config.location;

  if (name.includes("Ley-Line Anomaly")) return "Ley-Line Anomaly";
  if (name.includes("Invasion")) return "Invasions";
  if (name.includes("Fractal")) return "Fractal Incursions";
  if (name.includes("EU PvP") || name.includes("Tournament")) {
      if (name.includes("NA")) return "NA PvP Tournaments";
      if (name.includes("EU")) return "EU PvP Tournaments";
  }
  if (cat === "Day-Night Cycle") {
      if (name.includes("Cantha")) return "End of Dragons";
      if (name.includes("Castora")) return "Visions of Eternity";
      return "Day And Night";
  }
  if (name === "Convergence") return "Convergence";
  if (name.includes("Dragon Bash") || name.includes("Hologram")) return "Dragon Bash";
  if (name.includes("Halloween") || name.includes("Mad King")) return "Halloween";
  if (cat === "World Bosses") {
      if (dif === "Hardcore") return "Hard World Bosses";
      return "World Bosses";
  }
  
  if (loc === "Dry Top" || loc === "The Silverwastes") return "Living World Season 2";
  if (loc === "Verdant Brink" || loc === "Auric Basin" || loc === "Tangled Depths" || loc === "Dragon's Stand") return "Heart of Thorns";
  if (loc === "Lake Doric" || loc === "Bloodstone Fen" || loc === "Ember Bay" || loc === "Bitterfrost Frontier" || loc === "Draconis Mons" || loc === "Siren's Landing") return "Living World Season 3";
  if (loc === "Crystal Oasis" || loc === "Desert Highlands" || loc === "Elon Riverlands" || loc === "The Desolation" || loc === "Domain of Vabbi") return "Path of Fire";
  if (loc === "Domain of Istan" || loc === "Sandswept Isles" || loc === "Domain of Kourna" || loc === "Jahai Bluffs" || loc === "Thunderhead Peaks" || loc === "Dragonfall") return "Living World Season 4";
  if (loc === "Grothmar Valley" || loc === "Bjora Marches" || loc === "Drizzlewood Coast" || loc === "Dragonshalt") return "The Icebrood Saga";
  if (loc === "Seitung Province" || loc === "New Kaineng City" || loc === "The Echovald Wilds" || loc === "Dragon's End") return "End of Dragons";
  if (loc === "Skywatch Archipelago" || loc === "Amnytas" || loc === "Wizard's Tower" || loc === "Inner Nayos") return "Secrets of the Obscure";
  if (loc === "Janthir Syntri" || loc === "Lowland Shore") return "Janthir Wilds";
  if (loc === "Castora" || loc === "Shipwreck Strand" || loc === "Starlit Weald") return "Visions of Eternity";
  if (loc === "Eye of the North") return "Public Instances (Eye of the North)";
  if (loc === "Labyrinthine Cliffs") return "Special Events (Labyrinthine Cliffs)";
  
  return loc || cat; 
}

export interface CardEventData {
  config: GW2EventConfig;
  status: 'active' | 'upcoming' | 'passed';
  startMs: number;
  endMs: number;
  id: string; // unique card id
}

export function useEventTimers() {
  const [now, setNow] = useState<number>(Date.now());
  const typedEvents = eventsConfig as GW2EventConfig[];

  useEffect(() => {
    const ticker = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const cardData = useMemo(() => {
    // 1. Group JSON entries by name
    const grouped = new Map<string, GW2EventConfig[]>();
    typedEvents.forEach(conf => {
      if (!conf.offset) return; // skip missing offset
      const list = grouped.get(conf.name) || [];
      list.push(conf);
      grouped.set(conf.name, list);
    });

    const activeOrUpcoming: CardEventData[] = [];

    // 2. Find the best occurrence for each unique event using central logic
    grouped.forEach((configs, name) => {
      // For multiple configs with same name, find the most relevant one
      const states = configs.map(conf => ({
        conf,
        state: getEventStatus(conf, now)
      }));

      // Find if any is active
      const activeEntry = states.find(s => s.state.isActive);
      
      // If none active, find the one with closest future start
      const upcomingEntry = [...states]
        .filter(s => !s.state.isActive)
        .sort((a, b) => a.state.startMs - b.state.startMs)[0];

      const best = activeEntry || upcomingEntry;

      if (best) {
        activeOrUpcoming.push({
          config: best.conf,
          status: best.state.isActive ? 'active' : 'upcoming',
          startMs: best.state.startMs,
          endMs: best.state.endMs,
          id: `${best.conf.name}-${best.state.isActive ? 'active' : 'upcoming'}`
        });
      }
    });

    // 3. Group instances into final Rows
    const rowMap = new Map<string, CardEventData[]>();
    activeOrUpcoming.forEach(item => {
       const title = getEventRowTitle(item.config);
       if (!rowMap.has(title)) rowMap.set(title, []);
       rowMap.get(title)!.push(item);
    });

    const rows = Array.from(rowMap.entries()).map(([title, items]) => ({
       id: title,
       title,
       items: items.sort((a, b) => a.startMs - b.startMs)
    }));

    // 4. Sort rows by the explicit ROW_ORDER provided by the user
    rows.sort((a, b) => {
       let idxA = ROW_ORDER.indexOf(a.title);
       let idxB = ROW_ORDER.indexOf(b.title);
       if (idxA === -1) idxA = 999;
       if (idxB === -1) idxB = 999;
       if (idxA !== idxB) return idxA - idxB;
       return a.title.localeCompare(b.title);
    });

    return rows;
  }, [now]); 

  return { cardData, now };
}
