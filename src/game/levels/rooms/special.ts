import { parseRoom } from '../parseRoom';
import type { RoomData } from '@/types';
import { constellationOfRoom } from '../../constants';

// ── ROOM 49 — SOLOMON CHAMBER (Final Boss) ───────────────────────────────────

export const ROOM_49: RoomData = parseRoom({
  id: 49, name: 'Solomon Chamber', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.....###.....#',  // throne platform at top center
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.###.#.#.###.#',  // side platforms
    '#.............#',
    '#.###.....###.#',  // mid platforms
    '#.............#',
    '#.............#',
    '#.....K.......#',  // key in center-bottom area
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 7, type: 'coin' }, { x: 11, y: 7, type: 'coin' },
    { x: 7, y: 9, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 7, y: 1, type: 'wizard' },
    { x: 3, y: 5, type: 'saramandor' },
    { x: 11, y: 5, type: 'saramandor', facing: -1 },
    { x: 3, y: 7, type: 'gargoyle' },
    { x: 11, y: 7, type: 'gargoyle', facing: -1 },
  ],
  portals: [
    { x: 1, y: 5, type: 'ghost', max: 2, cooldown: 5000 },
    { x: 13, y: 5, type: 'ghost', max: 2, cooldown: 5000 },
  ],
});

// ── BONUS ROOMS (101-112) ────────────────────────────────────────────────────
// One bonus room per constellation world. Unlocked by collecting the
// constellation seal in each world's 4th stage.

function makeBonusRoom(id: number): RoomData {
  const ci = id - 101; // 0..11
  const theme = ci % 4;
  // Each bonus room is a tight challenge: key high up, enemies, no easy path
  const rows = [
    '###############',
    '#.............#',
    '#.BBB.BBB.BBB.#',
    '#.B.B.B.B.B.B.#',
    '#.BBB.BBB.BBB.#',
    '#.............#',
    '#.....K.......#',
    '#.............#',
    '#.BBB.BBB.BBB.#',
    '#.B.B.B.B.B.B.#',
    '#.BBB.BBB.BBB.#',
    '#S...........D#',
    '###############',
  ];
  const items: RoomData['items'] = [
    { x: 3, y: 5, type: 'coin' }, { x: 7, y: 5, type: 'coin' },
    { x: 11, y: 5, type: 'coin' }, { x: 7, y: 7, type: 'crystalOrange' },
  ];
  const enemies: RoomData['enemies'] = [
    { x: 4, y: 1, type: 'ghost' },
    { x: 10, y: 1, type: 'ghost' },
  ];
  const portals: RoomData['portals'] = [
    { x: 1, y: 1, type: 'demonhead', max: 2, cooldown: 3000 },
  ];
  return parseRoom({ id, name: `Bonus - ${constellationOfRoom(id - 100) >= 0 ? 'Star Chamber' : 'Bonus'}`, theme, rows, items, hidden: [], enemies, portals });
}

// ── PAGE OF TIME (room 201) ──────────────────────────────────────────────────

export const ROOM_201: RoomData = parseRoom({
  id: 201, name: 'Page of Time', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.....###.....#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#K....#.#....D#',
    '#.....#.#.....#',
    '#.....###.....#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 3, type: 'pageTime' },
    { x: 3, y: 11, type: 'coin' }, { x: 11, y: 11, type: 'coin' },
  ],
  hidden: [],
  enemies: [{ x: 7, y: 5, type: 'wizard' }],
  portals: [],
});

// Page of Time can't have two D's. Fix: use the standard single-door layout
// and put the pageTime item in the room for player to collect.

export const ROOM_201_FIXED: RoomData = parseRoom({
  id: 201, name: 'Page of Time', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....###.....#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.....###.....#',
    '#.............#',
    '#.....K.......#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 2, type: 'pageTime' },
    { x: 3, y: 11, type: 'coin' }, { x: 11, y: 11, type: 'coin' },
  ],
  hidden: [],
  enemies: [{ x: 7, y: 4, type: 'wizard' }],
  portals: [],
});

// ── PAGE OF SPACE (room 202) ─────────────────────────────────────────────────

export const ROOM_202: RoomData = parseRoom({
  id: 202, name: 'Page of Space', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BBB.BBB.BBB.#',
    '#.B.B.B.B.B.B.#',
    '#.BBB.BBB.BBB.#',
    '#.............#',
    '#.....K.......#',
    '#.............#',
    '#.BBB.BBB.BBB.#',
    '#.B.B.B.B.B.B.#',
    '#.BBB.BBB.BBB.#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 1, type: 'pageSpace' },
    { x: 3, y: 5, type: 'coin' }, { x: 11, y: 5, type: 'coin' },
  ],
  hidden: [],
  enemies: [
    { x: 4, y: 1, type: 'ghost' }, { x: 10, y: 1, type: 'ghost' },
  ],
  portals: [],
});

// ── PRINCESS CHAMBER (room 203) ──────────────────────────────────────────────

export const ROOM_203: RoomData = parseRoom({
  id: 203, name: 'Princess Chamber', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.....###.....#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.....###.....#',
    '#.............#',
    '#.............#',
    '#.....K.......#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 3, type: 'princess' },
    { x: 3, y: 9, type: 'coin' }, { x: 11, y: 9, type: 'coin' },
    { x: 7, y: 9, type: 'gem' },
  ],
  hidden: [],
  enemies: [],
  portals: [],
});

export const BONUS_ROOMS: RoomData[] = Array.from({ length: 12 }, (_, i) =>
  makeBonusRoom(101 + i)
);

export const SPECIAL_ROOMS: RoomData[] = [
  ROOM_49,
  ...BONUS_ROOMS,
  ROOM_201_FIXED,
  ROOM_202,
  ROOM_203,
];
