import { GW2EventConfig, ComputedEvent } from '../types/event';

export function parseHhMmToMs(timeStr: string): number {
  if (!timeStr) return 0;
  
  // Format could be "1.00:00" signifying Day.Hour:Minute
  if (timeStr.includes('.')) {
     const parts = timeStr.split('.');
     const days = parseInt(parts[0], 10);
     const timeParts = parts[1].split(':');
     const hours = parseInt(timeParts[0], 10);
     const minutes = parseInt(timeParts[1], 10);
     return (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  }
  
  // Normal "01:45" or "01:45Z"
  const clean = timeStr.replace('Z', '');
  const parts = clean.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
  }
  return 0;
}

export interface EventOccurrence {
  id: string;
  config: GW2EventConfig;
  startMs: number;
  endMs: number;
}

export function generateOccurrences(config: GW2EventConfig, startWindowMs: number, endWindowMs: number): EventOccurrence[] {
  const offsetMs = parseHhMmToMs(config.offset);
  const repeatMs = parseHhMmToMs(config.repeat);
  const durationMs = (parseInt(config.duration, 10) || 15) * 60 * 1000;
  
  const occurrences: EventOccurrence[] = [];
  
  const dStart = new Date(startWindowMs);
  const utcDayStart = Date.UTC(dStart.getUTCFullYear(), dStart.getUTCMonth(), dStart.getUTCDate());
  
  // Scan across previous, current, and next 2 days to ensure no overlap issues
  for(let d = -1; d <= 2; d++) {
      const baseUtc = utcDayStart + (d * 86400 * 1000);
      
      if (repeatMs === 0) {
          const startMs = baseUtc + offsetMs;
          const endMs = startMs + durationMs;
          if (endMs >= startWindowMs && startMs <= endWindowMs) {
              occurrences.push({ id: `${config.name}-${startMs}`, config, startMs, endMs });
          }
      } else {
          const timesPerDay = Math.ceil((24 * 60 * 60 * 1000) / repeatMs);
          for(let i = 0; i < timesPerDay + 2; i++) { // +2 buffer for edge cases spanning past midnight
              const startMs = baseUtc + offsetMs + (i * repeatMs);
              const endMs = startMs + durationMs;
              if (endMs >= startWindowMs && startMs <= endWindowMs) {
                  // prevent duplicates from overlapping day loops
                  if (!occurrences.find(o => o.id === `${config.name}-${startMs}`)) {
                      occurrences.push({ id: `${config.name}-${startMs}`, config, startMs, endMs });
                  }
              }
          }
      }
  }
  
  return occurrences;
}

export interface EventStatus {
  isActive: boolean;
  startMs: number;
  endMs: number;
  msUntilStart: number;
  msUntilEnd: number;
}

/**
 * Calculates the definitive state of an event at a given time.
 * This is the Single Source of Truth for the entire application.
 */
export function getEventStatus(config: GW2EventConfig, nowMs: number): EventStatus {
  const searchStart = nowMs - (24 * 60 * 60 * 1000); // 24h lookback
  const searchEnd = nowMs + (24 * 60 * 60 * 1000);  // 24h lookahead
  const occs = generateOccurrences(config, searchStart, searchEnd);
  
  // 1. Check for Active
  const active = occs.find(o => nowMs >= o.startMs && nowMs < o.endMs);
  if (active) {
    return {
      isActive: true,
      startMs: active.startMs,
      endMs: active.endMs,
      msUntilStart: active.startMs - nowMs,
      msUntilEnd: active.endMs - nowMs
    };
  }
  
  // 2. Find closest future
  const upcoming = occs
    .filter(o => o.startMs >= nowMs)
    .sort((a, b) => a.startMs - b.startMs)[0];
    
  if (upcoming) {
    return {
      isActive: false,
      startMs: upcoming.startMs,
      endMs: upcoming.endMs,
      msUntilStart: upcoming.startMs - nowMs,
      msUntilEnd: upcoming.endMs - nowMs
    };
  }

  // Fallback (should not happen with 24h lookahead)
  return {
    isActive: false,
    startMs: 0,
    endMs: 0,
    msUntilStart: 0,
    msUntilEnd: 0
  };
}
