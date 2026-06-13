import { parseRoom } from '../parseRoom';
import type { RoomData } from '@/types';
import { constellationOfRoom } from '../../constants';
import { WORLD_ROOMS_1_TO_3 } from './worlds1to3';
import { WORLD_ROOMS_4_TO_6 } from './worlds4to9';
import { WORLD_ROOMS_10_TO_12 } from './worlds10to12';
import { SPECIAL_ROOMS } from './special';

function makeRows(): string[] {
  const rows: string[] = [];
  rows.push('###############');
  for (let r = 1; r <= 10; r++) {
    let row = '#';
    for (let c = 1; c <= 13; c++) {
      if (r === 8 && c === 7) row += 'K';
      else if ((r === 9 || r === 10) && c === 7) row += 'B';
      else row += '.';
    }
    row += '#';
    rows.push(row);
  }
  rows.push('#S...........D#');
  rows.push('###############');
  return rows;
}

const PLACEHOLDER_ROWS = makeRows();

const ALL_IDS: number[] = [
  ...Array.from({ length: 49 }, (_, i) => i + 1),
  ...Array.from({ length: 12 }, (_, i) => i + 101),
  201, 202, 203,
];

function themeForId(id: number): number {
  if (id <= 48) return constellationOfRoom(id) % 4;
  return 0;
}

const ALL_REAL: RoomData[] = [
  ...WORLD_ROOMS_1_TO_3,
  ...WORLD_ROOMS_4_TO_6,
  ...WORLD_ROOMS_10_TO_12,
  ...SPECIAL_ROOMS,
];

const REAL_MAP = new Map<number, RoomData>(ALL_REAL.map((r) => [r.id, r]));

export const ROOMS: RoomData[] = ALL_IDS.map((id) => {
  const real = REAL_MAP.get(id);
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
