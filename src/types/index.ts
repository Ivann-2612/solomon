export const enum Tile {
  Empty = 0,
  Stone = 1, // solid stone
  Magic = 2, // breakable magic block
  Spawn = 3,
  Key = 4,
  Door = 5,
  Secret = 6, // hidden seal tile
  Item = 7
}

export type EnemyType = 'imp' | 'bat' | 'skull' | 'phantom' | 'gargoyle';
export type BossType = 'flame' | 'colossus' | 'serpent' | 'celestial' | 'king';
export type ItemType =
  | 'coin'
  | 'gem'
  | 'chest'
  | 'life'
  | 'time'
  | 'fire'
  | 'seal'
  | 'crown'
  | 'orb';

export interface ItemSpec {
  x: number;
  y: number;
  type: ItemType;
  hidden?: boolean; // hidden item puzzle: appears when all coins collected
}

export interface EnemySpec {
  x: number;
  y: number;
  type: EnemyType;
}

export interface PortalSpec {
  x: number;
  y: number;
  type: EnemyType;
  max: number; // max active enemies from this portal
  cooldown: number; // ms between spawns
}

export interface LevelData {
  id: number; // 1..64
  world: number; // 0..11 zodiac, 12 secret, 13 Solomon Chamber
  stage: number; // stage within world
  name: string;
  grid: number[][]; // [GRID_H][GRID_W]
  items: ItemSpec[];
  enemies: EnemySpec[];
  portals: PortalSpec[];
  time: number; // seconds
  boss?: BossType;
  secretExit?: number; // level id of secret stage this level can unlock
}

export type Action = 'left' | 'right' | 'jump' | 'create' | 'destroy' | 'fire' | 'pause';

export interface SaveSlot {
  exists: boolean;
  unlockedStage: number; // highest unlocked standard stage 1..48 (49 = Solomon)
  completedStages: number[];
  secretsUnlocked: number[]; // secret level ids discovered
  seals: number[]; // world indexes whose seal was collected
  crowns: number[];
  orbs: number[];
  pages: { time: boolean; space: boolean };
  princessUnlocked: boolean;
  totalScore: number;
  itemsCollected: number;
  secretsFound: number;
  bestGDV: number;
  bestGrade: string;
}

export interface RunStats {
  score: number;
  enemiesDefeated: number;
  itemsCollected: number;
  secretsFound: number;
  timeRemaining: number;
}
