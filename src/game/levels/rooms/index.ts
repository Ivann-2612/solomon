// Real room layouts for worlds 1-3 (ids 1-12); placeholder for the rest.
import { parseRoom } from '../parseRoom';
import type { RoomData } from '@/types';
import { constellationOfRoom } from '../../constants';
import { WORLD_ROOMS_1_TO_3 } from './worlds1to3';

function makeRows(): string[] {
  // 13 rows x 15 cols
  const rows: string[] = [];

  // row 0: full stone border
  rows.push('###############');

  // rows 1-10: interior
  for (let r = 1; r <= 10; r++) {
    let row = '#';
    for (let c = 1; c <= 13; c++) {
      if (r === 8 && c === 7) {
        row += 'K'; // key on top of pillar
      } else if ((r === 9 || r === 10) && c === 7) {
        row += 'B'; // magic block pillar
      } else {
        row += '.';
      }
    }
    row += '#';
    rows.push(row);
  }

  // row 11: floor with S at col 1, D at col 13
  // S = spawn, D = door, rest = Stone
  rows.push('#S...........D#');

  // row 12: bottom border
  rows.push('###############');

  return rows;
}

const PLACEHOLDER_ROWS = makeRows();

const ALL_IDS: number[] = [
  ...Array.from({ length: 49 }, (_, i) => i + 1),     // 1..49
  ...Array.from({ length: 12 }, (_, i) => i + 101),   // 101..112
  201, 202, 203,
];

function themeForId(id: number): number {
  if (id <= 48) return constellationOfRoom(id) % 4;
  return 0;
}

const REAL_IDS = new Set(WORLD_ROOMS_1_TO_3.map((r) => r.id));

export const ROOMS: RoomData[] = ALL_IDS.map((id) => {
  const real = WORLD_ROOMS_1_TO_3.find((r) => r.id === id);
  if (real) return real;
  return parseRoom({
    id,
    name: `Room ${id}`,
    theme: themeForId(id),
    rows: PLACEHOLDER_ROWS,
    items: [],
    hidden: [],
    enemies: [],
    portals: [],
    spawnFacing: 1,
  });
});

// Suppress unused-variable warning
void REAL_IDS;
