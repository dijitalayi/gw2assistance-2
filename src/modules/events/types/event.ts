export interface GW2EventConfig {
  name: string;
  colloquial?: string;
  offset: string;      // e.g., "01:45Z"
  repeat: string;      // e.g., "02:00", or "" for no repeat, or "1.00:00"
  difficulty: string;  // e.g., "Standard", "Hardcore", "Low-level"
  category: string;    // "World Bosses", "Meta Event", "Day-Night Cycle", etc.
  location: string;
  waypoint: string;
  wiki: string;
  duration: string;    // Length of event in minutes (e.g., "15")
  alert: number;       // Pre-event alert time in minutes (e.g., 10)
  icon?: string;       // Hex signature of the icon for wiki image servers (or local)
}

export interface ComputedEvent {
  id: string; // unique identifier based on name and category
  config: GW2EventConfig;
  nextSpawnTimeMs: number; // Unix timestamp of the exact next start time
  isSpawning: boolean; // True if we are inside the pre-event window (alert)
  isActive: boolean; // True if the event has started and hasn't exceeded its duration
  timeUntilSpawnMs: number; // Ms until the event starts
  durationPercent: number; // 0 to 100 percentage of the event's progression if active
}
