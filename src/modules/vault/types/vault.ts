export interface VaultObjectiveDef {
  id: number;
  title: string;
  track: "PvE" | "PvP" | "WvW";
  acclaim: number;
}

export interface PlayerObjective {
  id: number;
  progress_current: number;
  progress_complete: number;
  claimed: boolean;
  // Merged properties from VaultObjectiveDef
  title?: string;
  track?: "PvE" | "PvP" | "WvW";
  acclaim?: number;
}

export interface VaultTrack {
  meta_progress_current: number;
  meta_progress_complete: number;
  meta_reward_item_id: number;
  meta_reward_astral: number;
  meta_reward_claimed: boolean;
  objectives: PlayerObjective[];
}
