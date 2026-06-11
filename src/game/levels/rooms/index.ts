import { parseRoom } from '../parseRoom';
import type { RoomData } from '@/types';

// Placeholder room template — trivially solvable.
// Real layouts will be transcribed in a later task.
// Layout: border of Stone, floor near bottom, S bottom-left on floor,
// K on top of a small 2-high Magic Block pillar mid-room, D on the floor at the right.
//
// Row indices (0-based):
//   0       : top border (#)
//   1..10   : interior rows (walls on col 0 and col 14)
//   11      : floor row  (# everywhere)
//   12      : bottom border (#) — actually floor is row 11, border row 12
//
// Interior mid-col pillar for K: col 7
//   row 8:  B (Magic block, lower half of pillar)
//   row 9:  B (Magic block, upper half of pillar — wait, lower y = higher on screen)
//   row 7:  K  (key sits on top of pillar at row 7, pillar = rows 8..10 would be below)
//   Simpler: pillar occupies rows 9-10 (B), key at row 8 col 7
//   D at row 11 col 13 (on the floor row, but floor is #... use col 13 row 10 instead)

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

function constellationIndexForId(id: number): number {
  return Math.min(11, Math.floor((id - 1) / 4));
}

function themeForId(id: number): number {
  if (id <= 48) return constellationIndexForId(id) % 4;
  return 0;
}

export const ROOMS: RoomData[] = ALL_IDS.map((id) =>
  parseRoom({
    id,
    name: `Room ${id}`,
    theme: themeForId(id),
    rows: PLACEHOLDER_ROWS,
    items: [],
    hidden: [],
    enemies: [],
    portals: [],
    spawnFacing: 1,
  })
);
