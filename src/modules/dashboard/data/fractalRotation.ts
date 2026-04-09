export interface FractalDay {
  daily: string[];
  recommended: number[];
}

export const FRACTAL_ROTATION: Record<number, FractalDay> = {
  1: { daily: ["Nightmare", "Snowblind", "Volcanic"], recommended: [2, 37, 53] },
  2: { daily: ["Aetherblade", "Thaumanova Reactor", "Uncategorized"], recommended: [6, 28, 61] },
  3: { daily: ["Chaos", "Cliffside", "Twilight Oasis"], recommended: [10, 32, 65] },
  4: { daily: ["Captain Mai Trin Boss", "Deepstone", "Silent Surf"], recommended: [14, 34, 74] },
  5: { daily: ["Nightmare", "Snowblind", "Solid Ocean"], recommended: [19, 50, 70] },
  6: { daily: ["Chaos", "Uncategorized", "Urban Battleground"], recommended: [15, 48, 60] },
  7: { daily: ["Deepstone", "Molten Furnace", "Siren's Reef"], recommended: [24, 35, 66] },
  8: { daily: ["Molten Boss", "Twilight Oasis", "Underground Facility"], recommended: [21, 36, 75] },
  9: { daily: ["Silent Surf", "Swampland", "Volcanic"], recommended: [7, 40, 67] },
  10: { daily: ["Aquatic Ruins", "Lonely Tower", "Thaumanova Reactor"], recommended: [8, 31, 54] },
  11: { daily: ["Sunqua Peak", "Underground Facility", "Urban Battleground"], recommended: [11, 39, 59] },
  12: { daily: ["Aetherblade", "Chaos", "Nightmare"], recommended: [18, 27, 64] },
  13: { daily: ["Cliffside", "Lonely Tower", "Kinfall"], recommended: [4, 30, 58] },
  14: { daily: ["Deepstone", "Solid Ocean", "Swampland"], recommended: [16, 42, 62] },
  15: { daily: ["Captain Mai Trin Boss", "Molten Boss", "Shattered Observatory"], recommended: [5, 47, 68] }
};

/**
 * Calculates the current rotation day (1-15) based on a reference seed.
 * Seed: 2026-04-09 is Day 10.
 */
export function getCurrentFractalDay(): number {
  const referenceDate = new Date("2026-04-09T00:00:00Z");
  const referenceDayIndex = 10;
  
  const now = new Date();
  const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  const diffTime = utcNow.getTime() - referenceDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // (diffDays + currentDay - 1) % 15 + 1
  let result = (diffDays + referenceDayIndex - 1) % 15;
  if (result < 0) result += 15;
  
  return result + 1;
}
