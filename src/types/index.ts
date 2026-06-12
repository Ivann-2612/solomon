export enum Tile {
  Empty = 0,
  Stone = 1, // solid stone
  Magic = 2, // breakable magic block
  Spawn = 3,
  Key = 4,
  Door = 5,
  Secret = 6, // hidden seal tile
  Item = 7
}

export type EnemyType =
  | 'goblin'      // patrols ledges
  | 'saramandor'  // walks, breathes fire toward player
  | 'demonhead'   // flies straight
  | 'ghost'       // passes through blocks
  | 'gargoyle'    // stationary statue, shoots projectiles
  | 'wizard'      // teleports + casts
  // legacy aliases (pre-task-9 names, kept until Enemy.ts rewrite)
  | 'imp' | 'bat' | 'skull' | 'phantom';

export type BossType = 'flame' | 'colossus' | 'serpent' | 'celestial' | 'king';

export type ItemType =
  | 'bell' | 'fairy'
  | 'jarBlue' | 'jarOrange' | 'jarUpgrade'
  | 'crystalBlue' | 'crystalOrange'
  | 'medEdlem' | 'hourglass' | 'hourglassBlue' | 'medMeltona'
  | 'wings'
  | 'sealSolomon' | 'sealConstellation' | 'signConstellation'
  | 'coin' | 'jewel' | 'diamondBlue' | 'diamondOrange'
  | 'potionX2' | 'potionX5'
  | 'pageTime' | 'pageSpace' | 'princess'
  | 'key' // key may also appear as a hidden item inside a block
  // legacy aliases (pre-task-8 names, kept until GameScene/generator rewrite)
  | 'gem' | 'chest' | 'life' | 'time' | 'fire' | 'seal' | 'crown' | 'orb';

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
  facing?: 1 | -1;
}

export interface PortalSpec {
  x: number;
  y: number;
  type: EnemyType;
  max: number; // max active enemies from this portal
  cooldown: number; // ms between spawns
}

export interface RoomData {
  id: number;            // 1..48 zodiac, 49 final chamber, 101..112 bonus, 201/202 pages, 203 princess
  name: string;
  theme: number;         // wall theme index
  grid: number[][];      // [13][15] Tile values
  spawn: { x: number; y: number; facing: 1 | -1 };
  key: { x: number; y: number };
  door: { x: number; y: number };
  items: ItemSpec[];
  hidden: ItemSpec[];
  enemies: EnemySpec[];
  portals: PortalSpec[];
}

export interface RoomDef {
  id: number; name: string; theme: number;
  rows: string[];
  items: ItemSpec[]; hidden: ItemSpec[];
  enemies: EnemySpec[]; portals: PortalSpec[];
  spawnFacing?: 1 | -1;
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

export type Action = 'left' | 'right' | 'up' | 'jump' | 'duck' | 'create' | 'destroy' | 'fire' | 'pause';

export interface SaveSlot {
  exists: boolean;
  unlockedStage: number; // highest unlocked standard stage 1..48 (49 = Solomon)
  completedStages: number[];
  secretsUnlocked: number[]; // secret level ids discovered
  solomonSeals: number[];       // room ids whose Solomon's seal was collected
  constellationSeals: number[]; // constellation indices with seal collected
  fairies: number;
  room: number;                 // current room (resume point)
  wingsSkipsUsed: number;
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
