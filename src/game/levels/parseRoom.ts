import { Tile } from '@/types';
import type { RoomData, ItemSpec, HiddenItemSpec, EnemySpec, PortalSpec } from '@/types';
import { GRID_W, GRID_H } from '../constants';

export interface RoomDef {
  id: number; name: string; theme: number;
  rows: string[];
  items: ItemSpec[]; hidden: HiddenItemSpec[];
  enemies: EnemySpec[]; portals: PortalSpec[];
  spawnFacing?: 1 | -1;
}

const CH: Record<string, Tile> = { '#': Tile.Stone, B: Tile.Magic, '.': Tile.Empty, S: Tile.Empty, K: Tile.Empty, D: Tile.Empty };

export function parseRoom(def: RoomDef): RoomData {
  if (def.rows.length !== GRID_H) throw new Error(`room ${def.id}: ${def.rows.length} rows, want ${GRID_H}`);
  let spawn: RoomData['spawn'] | undefined, key: RoomData['key'] | undefined, door: RoomData['door'] | undefined;
  const grid: number[][] = [];
  for (let y = 0; y < GRID_H; y++) {
    const row = def.rows[y];
    if (row.length !== GRID_W) throw new Error(`room ${def.id} row ${y}: ${row.length} cols, want ${GRID_W}`);
    grid.push([...row].map((c, x) => {
      if (!(c in CH)) throw new Error(`room ${def.id}: bad char '${c}' at ${x},${y}`);
      if (c === 'S') spawn = { x, y, facing: def.spawnFacing ?? 1 };
      if (c === 'K') key = { x, y };
      if (c === 'D') door = { x, y };
      return CH[c];
    }));
  }
  if (!spawn || !key || !door) throw new Error(`room ${def.id}: missing S/K/D`);
  return { id: def.id, name: def.name, theme: def.theme, grid, spawn, key, door,
    items: def.items, hidden: def.hidden, enemies: def.enemies, portals: def.portals };
}
