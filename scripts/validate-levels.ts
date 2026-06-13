// Level validation: `npm run validate-levels`
// Checks all rooms for valid structure: spawn, key, door present, grid dimensions correct.
import { ROOMS } from '../src/game/levels/rooms';
import { GRID_W, GRID_H } from '../src/game/constants';
import { Tile } from '../src/types';

let ok = 0;
let fail = 0;

for (const room of ROOMS) {
  const errors: string[] = [];

  // Grid dimensions
  if (room.grid.length !== GRID_H) {
    errors.push(`grid height ${room.grid.length} ≠ ${GRID_H}`);
  }
  for (let y = 0; y < room.grid.length; y++) {
    if (room.grid[y].length !== GRID_W) {
      errors.push(`row ${y} width ${room.grid[y].length} ≠ ${GRID_W}`);
    }
  }

  // Tile type values
  for (let y = 0; y < room.grid.length; y++) {
    for (let x = 0; x < room.grid[y].length; x++) {
      const t = room.grid[y][x];
      if (![Tile.Stone, Tile.Magic, Tile.Empty, Tile.Secret].includes(t)) {
        errors.push(`unknown tile ${t} at ${x},${y}`);
      }
    }
  }

  // Spawn, key, door in bounds
  for (const [label, pt] of [['spawn', room.spawn], ['key', room.key], ['door', room.door]] as const) {
    if (pt.x <= 0 || pt.x >= GRID_W - 1 || pt.y <= 0 || pt.y >= GRID_H - 1) {
      errors.push(`${label} (${pt.x},${pt.y}) out of inner bounds`);
    }
  }

  // Border must be all stone
  for (let x = 0; x < GRID_W; x++) {
    if (room.grid[0][x] !== Tile.Stone) errors.push(`top border col ${x} not stone`);
    if (room.grid[GRID_H - 1][x] !== Tile.Stone) errors.push(`bottom border col ${x} not stone`);
  }
  for (let y = 0; y < GRID_H; y++) {
    if (room.grid[y][0] !== Tile.Stone) errors.push(`left border row ${y} not stone`);
    if (room.grid[y][GRID_W - 1] !== Tile.Stone) errors.push(`right border row ${y} not stone`);
  }

  const tag = `#${String(room.id).padStart(3, '0')} ${room.name.padEnd(30)}`;
  if (errors.length === 0) {
    console.log(`${tag} OK  (items:${room.items.length} enemies:${room.enemies.length} portals:${room.portals.length})`);
    ok++;
  } else {
    console.error(`${tag} FAIL  ${errors.join('; ')}`);
    fail++;
  }
}

console.log(`\n${ok}/${ok + fail} rooms valid`);
if (fail > 0) process.exit(1);
