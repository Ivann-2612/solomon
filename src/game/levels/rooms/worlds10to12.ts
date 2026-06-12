import { parseRoom } from '../parseRoom';
import type { RoomData } from '@/types';

// ── SAGITTARIUS (33-36, theme 0) ─────────────────────────────────────────────

const ROOM_33: RoomData = parseRoom({
  id: 33, name: 'Sagittarius 1 - The Archer Range', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.K...........#',
    '#.####........#',
    '#.............#',
    '#.....####....#',
    '#.............#',
    '#.........#####',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 3, type: 'coin' }, { x: 7, y: 5, type: 'coin' },
    { x: 11, y: 7, type: 'coin' }, { x: 7, y: 3, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 7, y: 4, type: 'goblin' },
    { x: 11, y: 6, type: 'gargoyle', facing: -1 },
  ],
  portals: [],
});

const ROOM_34: RoomData = parseRoom({
  id: 34, name: 'Sagittarius 2 - The Arching Path', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#...K.........#',
    '#...###.......#',
    '#.......###...#',
    '#.......###...#',
    '#...###.......#',
    '#...###.......#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 4, type: 'coin' }, { x: 9, y: 5, type: 'coin' },
    { x: 5, y: 7, type: 'coin' }, { x: 9, y: 3, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 6, y: 3, type: 'demonhead' },
    { x: 5, y: 8, type: 'goblin', facing: -1 },
  ],
  portals: [],
});

const ROOM_35: RoomData = parseRoom({
  id: 35, name: 'Sagittarius 3 - The Arrow Rain', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....####....#',
    '#.............#',
    '#K....####....#',
    '#.....####....#',
    '#.............#',
    '#.....####....#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 2, type: 'coin' }, { x: 7, y: 4, type: 'coin' },
    { x: 7, y: 7, type: 'coin' }, { x: 3, y: 4, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 10, y: 1, type: 'gargoyle', facing: -1 },
    { x: 10, y: 6, type: 'gargoyle', facing: -1 },
    { x: 6, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_36: RoomData = parseRoom({
  id: 36, name: 'Sagittarius 4 - The Sagittarius Seal', theme: 0, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BB..........#',
    '#.BB.K........#',
    '#.BB..........#',
    '#.............#',
    '#.....#######.#',
    '#.............#',
    '#.#######.....#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 6, type: 'coin' }, { x: 4, y: 8, type: 'coin' },
    { x: 8, y: 11, type: 'gem' },
  ],
  hidden: [{ x: 3, y: 2, type: 'sealConstellation' }],
  enemies: [
    { x: 7, y: 5, type: 'saramandor' },
    { x: 4, y: 9, type: 'wizard' },
  ],
  portals: [{ x: 13, y: 8, type: 'goblin', max: 3, cooldown: 3500 }],
});

// ── CAPRICORN (37-40, theme 1) ───────────────────────────────────────────────

const ROOM_37: RoomData = parseRoom({
  id: 37, name: 'Capricorn 1 - Mountain Climb', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.K...........#',
    '#.#...........#',
    '#.#.....####..#',
    '#.#.....#.....#',
    '#.#.....#.....#',
    '#.#######.....#',
    '#.............#',
    '#.......####..#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 4, type: 'coin' }, { x: 6, y: 7, type: 'coin' },
    { x: 9, y: 9, type: 'coin' }, { x: 3, y: 7, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 9, y: 4, type: 'goblin', facing: -1 },
    { x: 9, y: 9, type: 'demonhead' },
  ],
  portals: [],
});

const ROOM_38: RoomData = parseRoom({
  id: 38, name: 'Capricorn 2 - Narrow Pass', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.....K.......#',
    '#.#.#.#.#.#...#',
    '#.#.#.#.#.#...#',
    '#.............#',
    '#.#.#.#.#.#...#',
    '#.#.#.#.#.#...#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 2, y: 6, type: 'coin' }, { x: 4, y: 6, type: 'coin' },
    { x: 6, y: 6, type: 'coin' }, { x: 8, y: 3, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 9, y: 3, type: 'ghost' },
    { x: 10, y: 10, type: 'goblin', facing: -1 },
  ],
  portals: [],
});

const ROOM_39: RoomData = parseRoom({
  id: 39, name: 'Capricorn 3 - The Summit', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....K.......#',
    '#.....#.......#',
    '#.....#.......#',
    '#.####.####...#',
    '#.............#',
    '#.####.####...#',
    '#.............#',
    '#.####.####...#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 5, type: 'coin' }, { x: 9, y: 5, type: 'coin' },
    { x: 3, y: 9, type: 'coin' }, { x: 9, y: 9, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 3, y: 4, type: 'saramandor' },
    { x: 9, y: 4, type: 'saramandor', facing: -1 },
    { x: 7, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_40: RoomData = parseRoom({
  id: 40, name: 'Capricorn 4 - The Capricorn Seal', theme: 1, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....K.......#',
    '#.....#.......#',
    '#.....#.#.#...#',
    '#.....#.#.#...#',
    '#.....#####...#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 4, type: 'coin' }, { x: 9, y: 4, type: 'coin' },
    { x: 7, y: 11, type: 'gem' },
  ],
  hidden: [{ x: 8, y: 6, type: 'sealConstellation' }],
  enemies: [
    { x: 10, y: 3, type: 'wizard' },
    { x: 3, y: 10, type: 'saramandor' },
  ],
  portals: [
    { x: 1, y: 2, type: 'goblin', max: 2, cooldown: 3500 },
    { x: 13, y: 2, type: 'demonhead', max: 2, cooldown: 4000 },
  ],
});

// ── AQUARIUS (41-44, theme 2) ────────────────────────────────────────────────

const ROOM_41: RoomData = parseRoom({
  id: 41, name: 'Aquarius 1 - The Flow', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.....K.......#',
    '#.....#.......#',
    '#.#...#...#...#',
    '#.#...#...#...#',
    '#.#...#...#...#',
    '#.#########...#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 8, type: 'coin' }, { x: 6, y: 8, type: 'coin' },
    { x: 9, y: 5, type: 'coin' }, { x: 9, y: 8, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 3, y: 4, type: 'demonhead' },
    { x: 9, y: 4, type: 'ghost' },
  ],
  portals: [],
});

const ROOM_42: RoomData = parseRoom({
  id: 42, name: 'Aquarius 2 - The Aqueduct', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#K............#',
    '#.............#',
    '#.............#',
    '#.##########..#',
    '#.............#',
    '#.............#',
    '#..##########.#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 5, type: 'coin' }, { x: 9, y: 5, type: 'coin' },
    { x: 6, y: 8, type: 'coin' }, { x: 11, y: 8, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 5, y: 4, type: 'gargoyle' },
    { x: 11, y: 4, type: 'gargoyle', facing: -1 },
    { x: 8, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_43: RoomData = parseRoom({
  id: 43, name: 'Aquarius 3 - The Crystal Cave', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BBB.BBB.....#',
    '#.B.B.B.B.....#',
    '#.BBB.BBB.....#',
    '#.............#',
    '#.....K.......#',
    '#.............#',
    '#.BBB.BBB.....#',
    '#.B.B.B.B.....#',
    '#.BBB.BBB.....#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 11, y: 3, type: 'coin' }, { x: 11, y: 9, type: 'coin' },
    { x: 7, y: 11, type: 'coin' }, { x: 11, y: 6, type: 'crystalBlue' },
  ],
  hidden: [],
  enemies: [
    { x: 10, y: 1, type: 'ghost' },
    { x: 10, y: 7, type: 'ghost' },
  ],
  portals: [],
});

const ROOM_44: RoomData = parseRoom({
  id: 44, name: 'Aquarius 4 - The Aquarius Seal', theme: 2, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.K...........#',
    '#.#...........#',
    '#.#...#########',
    '#.#...........#',
    '#.#...........#',
    '#.###########.#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 5, y: 7, type: 'coin' }, { x: 9, y: 4, type: 'coin' },
    { x: 7, y: 11, type: 'gem' },
  ],
  hidden: [{ x: 7, y: 7, type: 'sealConstellation' }],
  enemies: [
    { x: 9, y: 3, type: 'wizard' },
    { x: 6, y: 8, type: 'saramandor' },
  ],
  portals: [{ x: 13, y: 5, type: 'ghost', max: 2, cooldown: 4000 }],
});

// ── PISCES (45-48, theme 3) ──────────────────────────────────────────────────

const ROOM_45: RoomData = parseRoom({
  id: 45, name: 'Pisces 1 - The Deep', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.........K...#',
    '#.........#...#',
    '#.........#...#',
    '#.########....#',
    '#.............#',
    '#.............#',
    '#.....####....#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 4, y: 6, type: 'coin' }, { x: 7, y: 9, type: 'coin' },
    { x: 11, y: 11, type: 'coin' }, { x: 6, y: 6, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 6, y: 5, type: 'ghost' },
    { x: 7, y: 9, type: 'saramandor', facing: -1 },
  ],
  portals: [],
});

const ROOM_46: RoomData = parseRoom({
  id: 46, name: 'Pisces 2 - Twin Fish', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.####...####.#',
    '#.####...####.#',
    '#.............#',
    '#K............#',
    '#.............#',
    '#.####...####.#',
    '#.####...####.#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 2, type: 'coin' }, { x: 10, y: 2, type: 'coin' },
    { x: 3, y: 7, type: 'coin' }, { x: 10, y: 7, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 7, y: 4, type: 'ghost' },
    { x: 7, y: 10, type: 'wizard' },
  ],
  portals: [],
});

const ROOM_47: RoomData = parseRoom({
  id: 47, name: 'Pisces 3 - The Final Tide', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BBB.........#',
    '#.B.B.....K...#',
    '#.BBB.........#',
    '#.............#',
    '#.....#######.#',
    '#.............#',
    '#.#######.....#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 7, y: 6, type: 'coin' }, { x: 4, y: 8, type: 'coin' },
    { x: 10, y: 11, type: 'gem' }, { x: 7, y: 8, type: 'jarOrange' },
  ],
  hidden: [],
  enemies: [
    { x: 7, y: 5, type: 'saramandor' },
    { x: 4, y: 9, type: 'wizard' },
    { x: 10, y: 9, type: 'ghost' },
  ],
  portals: [],
});

const ROOM_48: RoomData = parseRoom({
  id: 48, name: 'Pisces 4 - Gateway to Solomon', theme: 3, spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BBB.....BBB.#',
    '#.B.B.....B.B.#',
    '#.BBB.....BBB.#',
    '#.....K.......#',
    '#.............#',
    '#.###########.#',
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
  hidden: [{ x: 6, y: 7, type: 'sealConstellation' }],
  enemies: [
    { x: 4, y: 1, type: 'wizard' },
    { x: 10, y: 1, type: 'wizard' },
    { x: 7, y: 8, type: 'saramandor' },
  ],
  portals: [
    { x: 1, y: 7, type: 'ghost', max: 2, cooldown: 4000 },
    { x: 13, y: 7, type: 'ghost', max: 2, cooldown: 4000 },
  ],
});

export const WORLD_ROOMS_10_TO_12: RoomData[] = [
  ROOM_33, ROOM_34, ROOM_35, ROOM_36,
  ROOM_37, ROOM_38, ROOM_39, ROOM_40,
  ROOM_41, ROOM_42, ROOM_43, ROOM_44,
  ROOM_45, ROOM_46, ROOM_47, ROOM_48,
];
