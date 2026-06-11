import { Tile } from '@/types';
import { GRID_W, GRID_H } from '../constants';

// Automatic validation: a level is solvable when key and door are connected
// to the spawn through non-solid tiles (Dana can climb anywhere in an open
// region by creating magic blocks, and can break magic blocks in her way).
export function findTile(grid: number[][], tile: number): { x: number; y: number } | null {
  for (let y = 0; y < GRID_H; y++)
    for (let x = 0; x < GRID_W; x++) if (grid[y][x] === tile) return { x, y };
  return null;
}

export function reachableSet(grid: number[][], sx: number, sy: number): boolean[][] {
  const seen: boolean[][] = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(false));
  const stack = [[sx, sy]];
  seen[sy][sx] = true;
  while (stack.length) {
    const [x, y] = stack.pop()!;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
      if (seen[ny][nx]) continue;
      if (grid[ny][nx] === Tile.Stone) continue; // magic blocks are breakable -> passable
      seen[ny][nx] = true;
      stack.push([nx, ny]);
    }
  }
  return seen;
}

export function validateGrid(grid: number[][]): { ok: boolean; reason?: string } {
  const spawn = findTile(grid, Tile.Spawn);
  if (!spawn) return { ok: false, reason: 'no spawn' };
  const door = findTile(grid, Tile.Door);
  if (!door) return { ok: false, reason: 'no door' };
  const reach = reachableSet(grid, spawn.x, spawn.y);
  const key = findTile(grid, Tile.Key);
  if (key && !reach[key.y][key.x]) return { ok: false, reason: 'key unreachable' };
  if (!reach[door.y][door.x]) return { ok: false, reason: 'door unreachable' };
  return { ok: true };
}
