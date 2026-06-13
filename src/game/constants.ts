// Single-screen arcade rooms, pixel perfect, no scrolling.
// Grid 15x13 with 24x24 tiles -> 360x312 playfield + 24px HUD.
// (The nominal 320x240 virtual resolution of the spec cannot hold a full
// 15x13 grid of 24px tiles, so the virtual canvas is 360x336 and is
// integer/fit scaled to every device exactly like a 320x240 arcade screen.)
export const GRID_W = 15;
export const GRID_H = 13;
export const TILE = 24;
export const HUD_H = 24;
export const GAME_W = GRID_W * TILE; // 360
export const GAME_H = GRID_H * TILE + HUD_H; // 336

export const GRAVITY = 800;
export const RUN_SPEED = 92;
export const JUMP_VELOCITY = -258; // ~2.5 tiles, no double jump
export const FIREBALL_SPEED = 200;
export const FIREBALL_RANGE_TILES = 5;
export const FIREBALL_RANGE_UPGRADED = 8;

export const START_LIVES = 3;
export const MAX_CONTINUES = 3;

export const ZODIAC = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
] as const;

/** Returns 0-based constellation index (0=Aries … 11=Pisces) for a standard room id 1..48. */
export const constellationOfRoom = (id: number): number => Math.min(11, Math.floor((id - 1) / 4));

export const STAGES_PER_WORLD = 4;
export const STANDARD_STAGES = 48;
export const SECRET_STAGES = 15;
export const FINAL_STAGE_ID = 64;

export const POINTS = {
  coin: 50,
  gem: 200,
  chest: 500,
  life: 0,
  time: 0,
  fire: 300,
  seal: 1000,
  crown: 2000,
  orb: 1500,
  enemy: 100,
  boss: 2500,
  secondPerTimeBonus: 10
};
