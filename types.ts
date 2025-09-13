
export interface Skill {
    name: string;
    description: string;
    type: 'passive' | 'active';
}

export interface Trait {
    name: string;
    description: string;
    type: 'negative';
}

export interface Item {
    name: string;
    type: 'weapon' | 'food' | 'water' | 'medicine' | 'utility' | 'material';
    effect: {
        damage?: number;
        healing?: number;
        food?: number;
        water?: number;
    };
    craftable?: boolean;
    source?: ('cornucopia' | 'foraged' | 'built')[];
}

export type TributeStat = 'strength' | 'agility' | 'speed' | 'intelligence' | 'charisma';

export enum RelationshipLevel {
    MaximumAlly = 'Maximum Ally', // 80 to 100
    CloseAlly = 'Close Ally',     // 60 to 79
    Ally = 'Ally',                // 20 to 59
    Neutral = 'Neutral',          // -19 to 19
    Enemy = 'Enemy',              // -100 to -20
}

export interface Relationship {
    level: RelationshipLevel;
    score: number; // -100 (Hated Enemy) to 100 (Maximum Ally)
}

export interface Tribute {
  id: number;
  name: string;
  district: number;
  gender: 'Male' | 'Female';
  status: 'alive' | 'dead';
  strength: number; // 1-10
  agility: number; // 1-10
  speed: number; // 1-10
  intelligence: number; // 1-10
  charisma: number; // 1-10
  health: number; // 0-100
  maxHealth: number; // 0-100, can be lowered by severe injuries
  food: number; // 0-100
  water: number; // 0-100
  inventory: Item[];
  allies: number[]; // Array of tribute IDs
  kills: number;
  daysSurvived: number;
  causeOfDeath?: string;
  skills: Skill[];
  traits: Trait[];
  relationships: { [tributeId: number]: Relationship };
  allianceName?: string;
  morale: number; // -10 (Despair) to 10 (Confident)
}

export interface GameSettings {
  arenaType: string;
  eventSpeed: number; // ms delay between days
  tributeSet: 'book' | 'generic';
  maxDays: number;
  bloodbathDeaths: number;
  pacing: 'stream' | 'day' | 'instant';
}

export interface GameEvent {
    text: string;
    type: 'death' | 'combat' | 'alliance' | 'betrayal' | 'item' | 'neutral' | 'arena' | 'negative' | 'crafting' | 'positive' | 'trap';
    timestamp: string;
}

export interface GameDay {
    day: number; // 0 for Training, -0.5 for culling, 1 for Bloodbath + Day 1
    summary: string;
    events: GameEvent[];
    deaths: { tributeName: string; tributeId: number; cause: string }[];
}

export enum GameState {
    Idle = 'idle',
    Reaping = 'reaping',
    Running = 'running',
    Paused = 'paused',
    Finished = 'finished',
}

export interface GameSummary {
    winner: Tribute | null;
    placements: Tribute[]; // sorted tributes from 1st to 24th
    timeline: { day: number; tributeName: string; tributeId: number; cause: string }[];
    log: GameDay[];
}

export interface ArenaEffect {
    districts: number[];
    buffs?: Partial<Record<TributeStat, number>>;
    nerfs?: Partial<Record<TributeStat, number>>;
    description: string;
}

export interface Arena {
    name: string;
    type: 'forest' | 'jungle' | 'desert' | 'tundra' | 'urban' | 'mountain' | 'swamp' | 'random';
    description: string;
    image?: string; // Placeholder for now
    effects: ArenaEffect[];
}