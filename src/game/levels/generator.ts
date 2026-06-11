import { Tile } from '@/types';
import type { LevelData, ItemSpec, EnemySpec, PortalSpec, EnemyType } from '@/types';
import { GRID_W, GRID_H, FINAL_STAGE_ID } from '../constants';
import { mulberry32, irange, pick, type Rng } from '@/utils/rng';
import { validateGrid, reachableSet, findTile } from './validator';
import { worldOfLevel, stageOfLevel, levelName, bossOfLevel, secretLevelOfWorld } from './worlds';

const FLOOR_Y = GRID_H - 2; // 11
const PLATFORM_ROWS = [9, 7, 5, 3];

function emptyGrid(): number[][] {
  const g: number[][] = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(Tile.Empty));
  for (let x = 0; x < GRID_W; x++) {
    g[0][x] = Tile.Stone;
    g[GRID_H - 1][x] = Tile.Stone;
  }
  for (let y = 0; y < GRID_H; y++) {
    g[y][0] = Tile.Stone;
    g[y][GRID_W - 1] = Tile.Stone;
  }
  for (let x = 1; x < GRID_W - 1; x++) g[FLOOR_Y + 1][x] = Tile.Stone; // wait, FLOOR_Y+1 == GRID_H-1 already border
  return g;
}

function standableCells(g: number[][]): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let y = 1; y < GRID_H - 1; y++) {
    for (let x = 1; x < GRID_W - 1; x++) {
      if (g[y][x] === Tile.Empty && (g[y + 1][x] === Tile.Stone || g[y + 1][x] === Tile.Magic)) {
        out.push({ x, y });
      }
    }
  }
  return out;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function buildStandard(id: number, attempt: number): LevelData | null {
  const world = worldOfLevel(id);
  const stage = stageOfLevel(id);
  const rng = mulberry32(id * 7919 + attempt * 104729 + 12345);
  const g = emptyGrid();

  // solid floor
  for (let x = 1; x < GRID_W - 1; x++) g[FLOOR_Y][x] = Tile.Stone;

  const magicChance = 0.12 + world * 0.012 + stage * 0.01;

  // platforms
  for (const row of PLATFORM_ROWS) {
    let x = irange(rng, 1, 3);
    while (x < GRID_W - 2) {
      const len = irange(rng, 2, 5);
      for (let i = 0; i < len && x < GRID_W - 1; i++, x++) {
        g[row][x] = rng() < magicChance ? Tile.Magic : Tile.Stone;
      }
      x += irange(rng, 2, 4); // gap
    }
  }

  // a few pillars for variety
  const pillars = irange(rng, 0, 2);
  for (let p = 0; p < pillars; p++) {
    const px = irange(rng, 4, GRID_W - 4);
    const h = irange(rng, 1, 2);
    for (let i = 0; i < h; i++) g[FLOOR_Y - 1 - i][px] = Tile.Stone;
  }

  // clear spawn area (bottom-left)
  for (let y = FLOOR_Y - 3; y < FLOOR_Y; y++)
    for (let x = 1; x <= 2; x++) if (g[y][x] !== Tile.Empty) g[y][x] = Tile.Empty;
  g[FLOOR_Y - 1][1] = Tile.Spawn;
  const spawn = { x: 1, y: FLOOR_Y - 1 };

  // door: prefer high standable cell far from spawn
  let cells = standableCells(g).filter((c) => dist(c, spawn) > 8);
  if (!cells.length) return null;
  const high = cells.filter((c) => c.y <= 6);
  const doorCell = pick(rng, high.length ? high : cells);
  g[doorCell.y][doorCell.x] = Tile.Door;

  // key: standable, far from both
  cells = standableCells(g).filter((c) => dist(c, spawn) > 5 && dist(c, doorCell) > 5);
  if (!cells.length) cells = standableCells(g).filter((c) => dist(c, doorCell) > 3);
  if (!cells.length) return null;
  const keyCell = cells.sort(
    (a, b) => dist(b, spawn) + dist(b, doorCell) - (dist(a, spawn) + dist(a, doorCell))
  )[Math.floor(rng() * Math.min(4, cells.length))];
  g[keyCell.y][keyCell.x] = Tile.Key;

  const used = new Set<string>([`${doorCell.x},${doorCell.y}`, `${keyCell.x},${keyCell.y}`]);
  const take = (arr: { x: number; y: number }[]) => {
    const free = arr.filter((c) => !used.has(`${c.x},${c.y}`));
    if (!free.length) return null;
    const c = pick(rng, free);
    used.add(`${c.x},${c.y}`);
    return c;
  };

  // hidden room: treasure pocket sealed with magic blocks (hidden path)
  const items: ItemSpec[] = [];
  const cornerX = rng() < 0.5 ? GRID_W - 2 : GRID_W - 3;
  const cornerY = irange(rng, 1, 2);
  if (g[cornerY][cornerX] === Tile.Empty) {
    items.push({ x: cornerX, y: cornerY, type: rng() < 0.5 ? 'chest' : 'gem' });
    used.add(`${cornerX},${cornerY}`);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      const nx = cornerX + dx;
      const ny = cornerY + dy;
      if (nx > 0 && ny > 0 && nx < GRID_W - 1 && ny < GRID_H - 1 && g[ny][nx] === Tile.Empty) {
        g[ny][nx] = Tile.Magic;
      }
    }
  }

  // hidden seal (one per world, deterministic stage based on world)
  const sealStage = (world % 4) + 1;
  if (stage === sealStage) {
    const c = take(standableCells(g).filter((x) => !used.has(`${x.x},${x.y}`)));
    if (c) g[c.y][c.x] = Tile.Secret; // invisible until touched
  }

  // coins (+ hidden item puzzle: bonus appears when all coins collected)
  const coinCount = irange(rng, 3, 6);
  const stand = standableCells(g);
  for (let i = 0; i < coinCount; i++) {
    const c = take(stand);
    if (c) items.push({ x: c.x, y: c.y, type: 'coin' });
  }
  const hiddenC = take(stand);
  if (hiddenC)
    items.push({ x: hiddenC.x, y: hiddenC.y, type: rng() < 0.6 ? 'gem' : 'chest', hidden: true });
  if (rng() < 0.35) {
    const c = take(stand);
    if (c) items.push({ x: c.x, y: c.y, type: 'time' });
  }
  if (rng() < 0.2 + world * 0.01) {
    const c = take(stand);
    if (c) items.push({ x: c.x, y: c.y, type: 'fire' });
  }
  if (rng() < 0.08) {
    const c = take(stand);
    if (c) items.push({ x: c.x, y: c.y, type: 'life' });
  }

  // enemies, scaled by difficulty
  const pool: EnemyType[] = ['imp'];
  if (world >= 1) pool.push('bat');
  if (world >= 3) pool.push('skull');
  if (world >= 5) pool.push('phantom');
  if (world >= 8) pool.push('gargoyle');
  const enemyCount = Math.min(5, 1 + Math.floor(world / 2) + Math.floor(stage / 3));
  const enemies: EnemySpec[] = [];
  for (let i = 0; i < enemyCount; i++) {
    const c = take(stand.filter((s) => dist(s, spawn) > 4));
    if (c) enemies.push({ x: c.x, y: c.y, type: pick(rng, pool) });
  }

  // spawn portals (unlimited spawning w/ max active + cooldown)
  const portals: PortalSpec[] = [];
  if (world >= 2) {
    const portalCount = world >= 7 ? irange(rng, 1, 2) : 1;
    for (let i = 0; i < portalCount; i++) {
      const c = take(stand.filter((s) => dist(s, spawn) > 6));
      if (c)
        portals.push({
          x: c.x,
          y: c.y,
          type: pick(rng, pool),
          max: world >= 6 ? 2 : 1,
          cooldown: Math.max(3500, 8000 - world * 350)
        });
    }
  }

  if (!validateGrid(g).ok) return null;
  // all items must be reachable too
  const reach = reachableSet(g, spawn.x, spawn.y);
  if (!items.every((i) => reach[i.y][i.x])) return null;

  return {
    id,
    world,
    stage,
    name: levelName(id),
    grid: g,
    items,
    enemies,
    portals,
    time: Math.max(60, 130 - world * 5),
    secretExit: stage === sealStage ? secretLevelOfWorld(world) : undefined
  };
}

function buildBossArena(id: number): LevelData {
  const world = worldOfLevel(id);
  const rng = mulberry32(id * 31337 + 7);
  const g = emptyGrid();
  for (let x = 1; x < GRID_W - 1; x++) g[FLOOR_Y][x] = Tile.Stone;
  // side platforms
  for (const [x0, x1, y] of [
    [2, 5, 8],
    [GRID_W - 6, GRID_W - 3, 8],
    [5, 9, 5]
  ] as const) {
    for (let x = x0; x <= x1; x++) g[y][x] = rng() < 0.25 ? Tile.Magic : Tile.Stone;
  }
  g[FLOOR_Y - 1][2] = Tile.Spawn;
  g[FLOOR_Y - 1][GRID_W - 3] = Tile.Door; // opens when boss falls
  const items: ItemSpec[] = [
    { x: 3, y: 7, type: 'fire' },
    { x: GRID_W - 4, y: 7, type: 'time' }
  ];
  if (id === FINAL_STAGE_ID) {
    items.push({ x: 7, y: 4, type: 'crown' });
  }
  return {
    id,
    world,
    stage: stageOfLevel(id),
    name: levelName(id),
    grid: g,
    items,
    enemies: [],
    portals:
      id === FINAL_STAGE_ID
        ? [{ x: 3, y: FLOOR_Y - 1, type: 'phantom', max: 1, cooldown: 9000 }]
        : [],
    time: id === FINAL_STAGE_ID ? 180 : 120,
    boss: bossOfLevel(id)
  };
}

function buildSecret(id: number, attempt: number): LevelData | null {
  const rng = mulberry32(id * 52711 + attempt * 7919 + 3);
  const g = emptyGrid();
  for (let x = 1; x < GRID_W - 1; x++) g[FLOOR_Y][x] = Tile.Stone;
  // dense magic-block vaults
  for (const row of PLATFORM_ROWS) {
    let x = irange(rng, 1, 2);
    while (x < GRID_W - 2) {
      const len = irange(rng, 3, 6);
      for (let i = 0; i < len && x < GRID_W - 1; i++, x++) {
        g[row][x] = rng() < 0.5 ? Tile.Magic : Tile.Stone;
      }
      x += irange(rng, 1, 3);
    }
  }
  for (let y = FLOOR_Y - 3; y < FLOOR_Y; y++)
    for (let x = 1; x <= 2; x++) if (g[y][x] !== Tile.Empty) g[y][x] = Tile.Empty;
  g[FLOOR_Y - 1][1] = Tile.Spawn;
  const spawn = { x: 1, y: FLOOR_Y - 1 };
  const cells = standableCells(g).filter((c) => dist(c, spawn) > 8);
  if (!cells.length) return null;
  const doorCell = pick(rng, cells);
  g[doorCell.y][doorCell.x] = Tile.Door;
  const keyCells = standableCells(g).filter((c) => dist(c, doorCell) > 5);
  if (!keyCells.length) return null;
  const keyCell = pick(rng, keyCells);
  g[keyCell.y][keyCell.x] = Tile.Key;

  const used = new Set<string>([`${doorCell.x},${doorCell.y}`, `${keyCell.x},${keyCell.y}`]);
  const items: ItemSpec[] = [];
  const stand = standableCells(g).filter((c) => !used.has(`${c.x},${c.y}`));
  const treasures: ItemSpec['type'][] = ['gem', 'chest', 'coin', 'coin', 'gem', 'chest', 'coin'];
  for (const t of treasures) {
    if (!stand.length) break;
    const c = stand.splice(Math.floor(rng() * stand.length), 1)[0];
    items.push({ x: c.x, y: c.y, type: t });
  }
  // rare relics live in secret stages
  if (stand.length) {
    const c = stand.splice(Math.floor(rng() * stand.length), 1)[0];
    items.push({ x: c.x, y: c.y, type: id >= 61 ? 'crown' : 'orb' });
  }
  if (stand.length && rng() < 0.4) {
    const c = stand.splice(Math.floor(rng() * stand.length), 1)[0];
    items.push({ x: c.x, y: c.y, type: 'life' });
  }
  const enemies: EnemySpec[] = [];
  const n = irange(rng, 1, 3);
  for (let i = 0; i < n; i++) {
    if (!stand.length) break;
    const c = stand.splice(Math.floor(rng() * stand.length), 1)[0];
    enemies.push({ x: c.x, y: c.y, type: pick(rng, ['phantom', 'bat', 'skull'] as const) });
  }

  if (!validateGrid(g).ok) return null;
  const reach = reachableSet(g, spawn.x, spawn.y);
  if (!items.every((i) => reach[i.y][i.x])) return null;

  return {
    id,
    world: 12,
    stage: id - 48,
    name: levelName(id),
    grid: g,
    items,
    enemies,
    portals: [],
    time: 75
  };
}

function fallbackLevel(id: number): LevelData {
  // guaranteed-solvable simple room (used only if generation keeps failing)
  const g = emptyGrid();
  for (let x = 1; x < GRID_W - 1; x++) g[FLOOR_Y][x] = Tile.Stone;
  g[FLOOR_Y - 1][1] = Tile.Spawn;
  g[FLOOR_Y - 1][7] = Tile.Key;
  g[FLOOR_Y - 1][GRID_W - 2] = Tile.Door;
  return {
    id,
    world: worldOfLevel(id),
    stage: stageOfLevel(id),
    name: levelName(id),
    grid: g,
    items: [{ x: 4, y: FLOOR_Y - 1, type: 'coin' }],
    enemies: [{ x: 10, y: FLOOR_Y - 1, type: 'imp' }],
    portals: [],
    time: 90
  };
}

const cache = new Map<number, LevelData>();

export function getLevel(id: number): LevelData {
  const hit = cache.get(id);
  if (hit) return hit;
  let lvl: LevelData | null = null;
  if (bossOfLevel(id)) {
    lvl = buildBossArena(id);
  } else if (id >= 49 && id <= 63) {
    for (let a = 0; a < 12 && !lvl; a++) lvl = buildSecret(id, a);
  } else {
    for (let a = 0; a < 12 && !lvl; a++) lvl = buildStandard(id, a);
  }
  if (!lvl || !validateGrid(lvl.grid).ok) lvl = fallbackLevel(id);
  cache.set(id, lvl);
  return lvl;
}

export function validateAllLevels(): { id: number; ok: boolean; reason?: string }[] {
  const out: { id: number; ok: boolean; reason?: string }[] = [];
  for (let id = 1; id <= FINAL_STAGE_ID; id++) {
    const lvl = getLevel(id);
    const v = validateGrid(lvl.grid);
    out.push({ id, ok: v.ok, reason: v.reason });
  }
  return out;
}

export { findTile };
