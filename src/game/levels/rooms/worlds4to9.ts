import { parseRoom } from '../parseRoom';
import type { RoomData } from '@/types';

// ── CANCER (13-16, theme 3) ──────────────────────────────────────────────────

const ROOM_13: RoomData = parseRoom({
  id: 13, name: 'Cancer 1 - The Tidal Shore', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.........K...#',
    '#.......####..#',
    '#.............#',
    '#.....####....#',
    '#.............#',
    '#.###.........#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 11, type: 'coin' }, { x: 7, y: 11, type: 'coin' },
    { x: 11, y: 11, type: 'coin' }, { x: 7, y: 6, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 9, y: 3, type: 'demonhead' },
    { x: 3, y: 8, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_14: RoomData = parseRoom({
  id: 14, name: 'Cancer 2 - The Crab Den', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.###.....###.#',
    '#.###.....###.#',
    '#.............#',
    '#K....###.....#',
    '#.....###.....#',
    '#.............#',
    '#.###.....###.#',
    '#.###.....###.#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 2, y: 4, type: 'coin' }, { x: 7, y: 4, type: 'coin' },
    { x: 2, y: 10, type: 'coin' }, { x: 7, y: 6, type: 'gem' },
  ],
  hidden: [],
  enemies: [{ x: 7, y: 4, type: 'saramandor' }],
  portals: [],
});

const ROOM_15: RoomData = parseRoom({
  id: 15, name: 'Cancer 3 - The Coral Maze', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.BB.BB.BB....#',
    '#.BB.BB.BB....#',
    '#.............#',
    '#.BB.BB.BB....#',
    '#.BB.BB.BB.K..#',
    '#.............#',
    '#.BB.BB.BB....#',
    '#.BB.BB.BB....#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 2, y: 9, type: 'coin' }, { x: 5, y: 9, type: 'coin' },
    { x: 8, y: 9, type: 'coin' }, { x: 12, y: 3, type: 'gem' },
  ],
  hidden: [],
  enemies: [{ x: 12, y: 3, type: 'ghost' }],
  portals: [],
});

const ROOM_16: RoomData = parseRoom({
  id: 16, name: 'Cancer 4 - The Shell Gate', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....K.......#',
    '#.....#.......#',
    '#.....#.......#',
    '#.....#.......#',
    '#.....#.......#',
    '#.....####....#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 4, y: 11, type: 'coin' }, { x: 9, y: 11, type: 'coin' },
    { x: 7, y: 7, type: 'gem' },
  ],
  hidden: [{ x: 9, y: 7, type: 'sealConstellation' }],
  enemies: [
    { x: 3, y: 10, type: 'goblin' },
    { x: 11, y: 10, type: 'saramandor', facing: -1 },
  ],
  portals: [{ x: 13, y: 3, type: 'goblin', max: 2, cooldown: 4000 }],
});

// ── LEO (17-20, theme 0) ─────────────────────────────────────────────────────

const ROOM_17: RoomData = parseRoom({
  id: 17, name: 'Leo 1 - The Mane', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.....K.......#',
    '#.....#.......#',
    '#.#...#...#...#',
    '#.#...#...#...#',
    '#.#########...#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 11, type: 'coin' }, { x: 10, y: 11, type: 'coin' },
    { x: 6, y: 7, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 4, y: 6, type: 'saramandor' },
    { x: 9, y: 6, type: 'saramandor', facing: -1 },
  ],
  portals: [],
});

const ROOM_18: RoomData = parseRoom({
  id: 18, name: 'Leo 2 - The Sunlit Throne', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.K...........#',
    '#.#...........#',
    '#.#...........#',
    '#.#.########..#',
    '#.............#',
    '#.........#...#',
    '#.........#...#',
    '#.........#...#',
    '#.........#...#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 6, y: 5, type: 'coin' }, { x: 10, y: 5, type: 'coin' },
    { x: 10, y: 7, type: 'gem' }, { x: 3, y: 11, type: 'coin' },
  ],
  hidden: [],
  enemies: [
    { x: 11, y: 4, type: 'gargoyle', facing: -1 },
    { x: 7, y: 10, type: 'demonhead' },
  ],
  portals: [],
});

const ROOM_19: RoomData = parseRoom({
  id: 19, name: 'Leo 3 - The Gargoyle Hall', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#...K.........#',
    '#...#.........#',
    '#...#.......#.#',
    '#...#.......#.#',
    '#...####...##.#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 11, type: 'coin' }, { x: 9, y: 11, type: 'coin' },
    { x: 5, y: 7, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 12, y: 4, type: 'gargoyle', facing: -1 },
    { x: 1, y: 7, type: 'gargoyle' },
    { x: 7, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_20: RoomData = parseRoom({
  id: 20, name: 'Leo 4 - The Leo Seal', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.............#',
    '#K............#',
    '#.............#',
    '#.##########..#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 6, type: 'coin' }, { x: 9, y: 6, type: 'coin' },
    { x: 7, y: 6, type: 'gem' },
  ],
  hidden: [{ x: 6, y: 6, type: 'sealConstellation' }],
  enemies: [
    { x: 4, y: 5, type: 'saramandor' },
    { x: 9, y: 5, type: 'goblin', facing: -1 },
  ],
  portals: [{ x: 13, y: 4, type: 'saramandor', max: 2, cooldown: 5000 }],
});

// ── VIRGO (21-24, theme 1) ───────────────────────────────────────────────────

const ROOM_21: RoomData = parseRoom({
  id: 21, name: 'Virgo 1 - The Harvest Field', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#...K.........#',
    '#...####......#',
    '#.............#',
    '#.......####..#',
    '#.............#',
    '#...####......#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 4, type: 'coin' }, { x: 9, y: 6, type: 'coin' },
    { x: 5, y: 8, type: 'coin' }, { x: 9, y: 8, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 6, y: 3, type: 'goblin' },
    { x: 10, y: 5, type: 'demonhead', facing: -1 },
  ],
  portals: [],
});

const ROOM_22: RoomData = parseRoom({
  id: 22, name: 'Virgo 2 - The Magic Grove', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.BBB.........#',
    '#.BBB.........#',
    '#.............#',
    '#.........BBB.#',
    '#.........BBB.#',
    '#.............#',
    '#.BBB.........#',
    '#.BBB.....K...#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 2, y: 6, type: 'coin' }, { x: 11, y: 6, type: 'coin' },
    { x: 2, y: 3, type: 'coin' }, { x: 10, y: 3, type: 'gem' },
  ],
  hidden: [{ x: 3, y: 8, type: 'crystalBlue' }],
  enemies: [{ x: 8, y: 5, type: 'ghost' }, { x: 5, y: 10, type: 'goblin' }],
  portals: [],
});

const ROOM_23: RoomData = parseRoom({
  id: 23, name: 'Virgo 3 - The Spirit Walk', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....######..#',
    '#.....#.......#',
    '#K....#.......#',
    '#.....#.......#',
    '#.....######..#',
    '#.............#',
    '#.....######..#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 8, y: 2, type: 'coin' }, { x: 8, y: 8, type: 'coin' },
    { x: 3, y: 11, type: 'coin' }, { x: 9, y: 5, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 10, y: 1, type: 'ghost' },
    { x: 10, y: 7, type: 'ghost' },
    { x: 5, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_24: RoomData = parseRoom({
  id: 24, name: 'Virgo 4 - The Sigil Gate', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.....K.......#',
    '#.....#.......#',
    '#.#####.......#',
    '#.............#',
    '#.......#####.#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 5, type: 'coin' }, { x: 9, y: 7, type: 'coin' },
    { x: 7, y: 11, type: 'gem' },
  ],
  hidden: [{ x: 4, y: 5, type: 'sealConstellation' }],
  enemies: [
    { x: 12, y: 6, type: 'wizard' },
    { x: 3, y: 10, type: 'goblin' },
  ],
  portals: [{ x: 1, y: 3, type: 'demonhead', max: 2, cooldown: 4500 }],
});

// ── LIBRA (25-28, theme 2) ───────────────────────────────────────────────────

const ROOM_25: RoomData = parseRoom({
  id: 25, name: 'Libra 1 - The Balance', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.###...###...#',
    '#.###...###...#',
    '#.............#',
    '#.......K.....#',
    '#.............#',
    '#.###...###...#',
    '#.###...###...#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 4, type: 'coin' }, { x: 9, y: 4, type: 'coin' },
    { x: 3, y: 9, type: 'coin' }, { x: 9, y: 1, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 7, y: 4, type: 'ghost' },
    { x: 5, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_26: RoomData = parseRoom({
  id: 26, name: 'Libra 2 - The Scale', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.K...........#',
    '#.#...........#',
    '#.#...........#',
    '#.###########.#',
    '#.............#',
    '#.########....#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 6, y: 5, type: 'coin' }, { x: 5, y: 7, type: 'coin' },
    { x: 11, y: 11, type: 'coin' }, { x: 9, y: 7, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 6, y: 4, type: 'saramandor' },
    { x: 5, y: 8, type: 'demonhead' },
  ],
  portals: [],
});

const ROOM_27: RoomData = parseRoom({
  id: 27, name: 'Libra 3 - The Counterweight', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.....K.......#',
    '#.....#.......#',
    '#.....#.......#',
    '#.....#########',
    '#.............#',
    '#.########....#',
    '#.............#',
    '#.###.........#',
    '#.###.........#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 4, y: 4, type: 'coin' }, { x: 5, y: 6, type: 'coin' },
    { x: 3, y: 8, type: 'coin' }, { x: 7, y: 3, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 6, y: 6, type: 'gargoyle' },
    { x: 3, y: 9, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_28: RoomData = parseRoom({
  id: 28, name: 'Libra 4 - The Libra Seal', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BBB.....K...#',
    '#.B.B.........#',
    '#.BBB.........#',
    '#.............#',
    '#.............#',
    '#.........BBB.#',
    '#.........B.B.#',
    '#.........BBB.#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 4, y: 6, type: 'coin' }, { x: 8, y: 6, type: 'coin' },
    { x: 3, y: 11, type: 'gem' },
  ],
  hidden: [{ x: 10, y: 7, type: 'sealConstellation' }],
  enemies: [
    { x: 8, y: 1, type: 'ghost' },
    { x: 5, y: 10, type: 'goblin' },
  ],
  portals: [{ x: 13, y: 6, type: 'ghost', max: 2, cooldown: 4000 }],
});

// ── SCORPIO (29-32, theme 3) ─────────────────────────────────────────────────

const ROOM_29: RoomData = parseRoom({
  id: 29, name: 'Scorpio 1 - The Dark Lair', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.....K.......#',
    '#...######....#',
    '#.............#',
    '#.............#',
    '#...######....#',
    '#.............#',
    '#...######....#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 4, type: 'coin' }, { x: 5, y: 7, type: 'coin' },
    { x: 5, y: 9, type: 'coin' }, { x: 9, y: 4, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 6, y: 3, type: 'saramandor' },
    { x: 6, y: 6, type: 'goblin', facing: -1 },
    { x: 8, y: 10, type: 'demonhead' },
  ],
  portals: [],
});

const ROOM_30: RoomData = parseRoom({
  id: 30, name: 'Scorpio 2 - The Gargoyle Keep', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.########....#',
    '#.#.......#...#',
    '#.#.......#...#',
    '#.#.K.....#...#',
    '#.#.......#...#',
    '#.#########...#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 2, type: 'coin' }, { x: 3, y: 7, type: 'coin' },
    { x: 11, y: 10, type: 'coin' }, { x: 6, y: 3, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 10, y: 4, type: 'gargoyle', facing: -1 },
    { x: 2, y: 4, type: 'gargoyle' },
    { x: 8, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_31: RoomData = parseRoom({
  id: 31, name: 'Scorpio 3 - The Wizard Tower', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.K...........#',
    '#.#...........#',
    '#.#...........#',
    '#.#########...#',
    '#.............#',
    '#.............#',
    '#.....####....#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 6, type: 'coin' }, { x: 7, y: 9, type: 'coin' },
    { x: 10, y: 11, type: 'coin' }, { x: 7, y: 6, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 10, y: 5, type: 'wizard' },
    { x: 4, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_32: RoomData = parseRoom({
  id: 32, name: 'Scorpio 4 - The Scorpio Seal', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....K.......#',
    '#.....#.......#',
    '#.....#.......#',
    '#.....#.#.....#',
    '#.....#.#.....#',
    '#.....###.....#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 4, y: 7, type: 'coin' }, { x: 10, y: 7, type: 'coin' },
    { x: 7, y: 11, type: 'gem' },
  ],
  hidden: [{ x: 8, y: 5, type: 'sealConstellation' }],
  enemies: [
    { x: 10, y: 4, type: 'saramandor', facing: -1 },
    { x: 3, y: 10, type: 'wizard' },
  ],
  portals: [
    { x: 1, y: 2, type: 'goblin', max: 2, cooldown: 3500 },
    { x: 13, y: 2, type: 'demonhead', max: 1, cooldown: 4000 },
  ],
});

export const WORLD_ROOMS_4_TO_6: RoomData[] = [
  ROOM_13, ROOM_14, ROOM_15, ROOM_16,
  ROOM_17, ROOM_18, ROOM_19, ROOM_20,
  ROOM_21, ROOM_22, ROOM_23, ROOM_24,
  ROOM_25, ROOM_26, ROOM_27, ROOM_28,
  ROOM_29, ROOM_30, ROOM_31, ROOM_32,
];
