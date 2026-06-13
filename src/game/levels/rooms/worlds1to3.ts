import { parseRoom } from '../parseRoom';
import type { RoomData } from '@/types';

// ── ARIES (rooms 1-4, theme 0) ────────────────────────────────────────────

const ROOM_1: RoomData = parseRoom({
  id: 1,
  name: 'Aries 1 - The Rampart',
  theme: 0,
  spawnFacing: 1,
  rows: [
    '###############',
    '#............T#',  // T = secret tile (top-right corner)
    '#.............#',
    '#.....K.......#',  // K at (6,3)
    '#.....#.......#',
    '#.............#',
    '#...###.......#',  // platform (4-6, 6)
    '#.............#',
    '#.........###.#',  // platform (10-12, 8)
    '#.............#',
    '#.............#',
    '#S...........D#',  // S at (1,11), D at (13,11)
    '###############',
  ],
  items: [
    { x: 3, y: 11, type: 'coin' },
    { x: 6, y: 11, type: 'coin' },
    { x: 9, y: 11, type: 'coin' },
    { x: 5, y: 6, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 11, y: 7, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_2: RoomData = parseRoom({
  id: 2,
  name: 'Aries 2 - The Stairway',
  theme: 0,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#...........K.#',  // K at (12,2)
    '#...........#.#',  // platform under key (12,3)
    '#.........###.#',  // (10-12, 4)
    '#.......###...#',  // (8-10, 5)
    '#.....###.....#',  // (6-8, 6)
    '#...###.......#',  // (4-6, 7)
    '#.###.........#',  // (2-4, 8)
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 8, type: 'coin' },
    { x: 5, y: 7, type: 'coin' },
    { x: 7, y: 6, type: 'coin' },
    { x: 9, y: 5, type: 'coin' },
    { x: 11, y: 4, type: 'gem' },
    { x: 12, y: 9, type: 'jarBlue', hidden: true },
  ],
  hidden: [],
  enemies: [
    { x: 4, y: 11, type: 'goblin' },
    { x: 8, y: 11, type: 'goblin', facing: -1 },
  ],
  portals: [],
});

const ROOM_3: RoomData = parseRoom({
  id: 3,
  name: 'Aries 3 - The Vaulted Hall',
  theme: 0,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.K...........#',  // K at (2,1) — high up, need block-climbing
    '#.............#',
    '#.............#',
    '#.....####....#',  // platform (6-9, 4)
    '#.............#',
    '#.....####....#',  // platform (6-9, 6)
    '#.............#',
    '#.####........#',  // platform (2-5, 8)
    '#.............#',
    '#.####........#',  // platform (2-5, 10)
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 8, type: 'coin' },
    { x: 7, y: 4, type: 'coin' },
    { x: 7, y: 6, type: 'gem' },
    { x: 12, y: 11, type: 'coin' },
  ],
  hidden: [],
  enemies: [
    { x: 8, y: 3, type: 'demonhead' },
    { x: 3, y: 10, type: 'goblin', facing: -1 },
  ],
  portals: [],
});

const ROOM_4: RoomData = parseRoom({
  id: 4,
  name: 'Aries 4 - The Scorched Gate',
  theme: 0,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#...........K.#',  // K at (12,3)
    '#...........#.#',  // platform (12,4)
    '#...........#.#',
    '#...........#.#',
    '#.##########..#',  // big platform (2-11, 7)
    '#.............#',
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 4, y: 11, type: 'coin' },
    { x: 7, y: 11, type: 'coin' },
    { x: 10, y: 11, type: 'coin' },
    { x: 7, y: 7, type: 'gem' },
    { x: 11, y: 7, type: 'coin' },
    { x: 7, y: 2, type: 'sealConstellation', hidden: true },
  ],
  hidden: [],
  enemies: [
    { x: 5, y: 6, type: 'goblin' },
    { x: 9, y: 6, type: 'goblin', facing: -1 },
  ],
  portals: [
    { x: 1, y: 7, type: 'goblin', max: 2, cooldown: 4000 },
  ],
});

// ── TAURUS (rooms 5-8, theme 1) ─────────────────────────────────────────────

const ROOM_5: RoomData = parseRoom({
  id: 5,
  name: 'Taurus 1 - Stone Meadow',
  theme: 1,
  spawnFacing: -1,   // spawn on right, face left
  rows: [
    '###############',
    '#.............#',
    '#.............#',
    '#.K...........#',  // K at (2,3) — left side, door also left
    '#.#...........#',
    '#.#...###.....#',  // platform (6-8, 5)
    '#.#...###.....#',
    '#.............#',
    '#.......###...#',  // platform (8-10, 8)
    '#.......###...#',
    '#.............#',
    '#D...........S#',  // D at (1,11), S at (13,11)
    '###############',
  ],
  items: [
    { x: 12, y: 11, type: 'coin' },
    { x: 9, y: 11, type: 'coin' },
    { x: 7, y: 5, type: 'coin' },
    { x: 2, y: 11, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 9, y: 7, type: 'goblin', facing: -1 },
  ],
  portals: [],
});

const ROOM_6: RoomData = parseRoom({
  id: 6,
  name: 'Taurus 2 - The Labyrinth',
  theme: 1,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.##.##.##....#',  // magic block maze row 1
    '#.##.##.##....#',
    '#.............#',
    '#.##.##.##....#',
    '#.##.##.##.K..#',  // K at (12,6)
    '#.............#',
    '#.##.##.......#',
    '#.##.##.......#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 2, y: 11, type: 'coin' },
    { x: 5, y: 11, type: 'coin' },
    { x: 8, y: 11, type: 'coin' },
    { x: 11, y: 4, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 10, y: 3, type: 'saramandor' },
  ],
  portals: [],
});

const ROOM_7: RoomData = parseRoom({
  id: 7,
  name: 'Taurus 3 - The Furnace',
  theme: 1,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.....######..#',  // platform (6-11, 2)
    '#.....#.......#',
    '#.....#.....K.#',  // K at (12,4)
    '#.....#.......#',
    '#.....#.......#',
    '#.....######..#',  // platform (6-11, 7)
    '#.............#',
    '#.....######..#',  // platform (6-11, 9)
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 11, type: 'coin' },
    { x: 8, y: 2, type: 'coin' },
    { x: 12, y: 7, type: 'coin' },
    { x: 8, y: 7, type: 'gem' },
    { x: 3, y: 9, type: 'jarOrange' },
  ],
  hidden: [],
  enemies: [
    { x: 4, y: 10, type: 'saramandor' },
    { x: 10, y: 8, type: 'saramandor', facing: -1 },
  ],
  portals: [],
});

const ROOM_8: RoomData = parseRoom({
  id: 8,
  name: 'Taurus 4 - The Grand Arch',
  theme: 1,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BB..........#',  // magic blocks (2-3, 2)
    '#.BB..K.......#',  // K at (6,3), magic blocks (2-3, 3)
    '#.BB..#.......#',  // platform at (6,4)
    '#.BB..#...BBB.#',  // magic blocks (10-12, 5) and (2-3, 5)
    '#.....#...BBB.#',  // magic blocks (10-12, 6)
    '#.....#.......#',
    '#.....#########',  // big wall on right
    '#.............#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 11, type: 'coin' },
    { x: 6, y: 11, type: 'coin' },
    { x: 4, y: 3, type: 'gem' },
  ],
  hidden: [{ x: 11, y: 5, type: 'sealConstellation' }],
  enemies: [
    { x: 7, y: 10, type: 'demonhead' },
    { x: 11, y: 8, type: 'goblin', facing: -1 },
  ],
  portals: [
    { x: 13, y: 3, type: 'goblin', max: 2, cooldown: 5000 },
  ],
});

// ── GEMINI (rooms 9-12, theme 2) ─────────────────────────────────────────────

const ROOM_9: RoomData = parseRoom({
  id: 9,
  name: 'Gemini 1 - Twin Pillars',
  theme: 2,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#...##...##...#',  // twin pillars, (4-5, 2) and (9-10, 2)
    '#...##...##...#',
    '#...##...##...#',
    '#...##...##...#',
    '#...##K..##...#',  // K at (7,6) - between the pillars
    '#...##...##...#',
    '#...##...##...#',
    '#...##...##...#',
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 2, y: 11, type: 'coin' },
    { x: 7, y: 11, type: 'coin' },
    { x: 12, y: 11, type: 'coin' },
    { x: 7, y: 4, type: 'gem' },
  ],
  hidden: [],
  enemies: [
    { x: 7, y: 3, type: 'ghost' },
  ],
  portals: [],
});

const ROOM_10: RoomData = parseRoom({
  id: 10,
  name: 'Gemini 2 - The Mirror',
  theme: 2,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.............#',
    '#.BBB...BBB...#',  // symmetric magic block structures
    '#.B.B...B.B...#',
    '#.BBB...BBB...#',
    '#.............#',
    '#.....K.......#',  // K at (6,6)
    '#.............#',
    '#.BBB...BBB...#',
    '#.B.B...B.B...#',
    '#.BBB...BBB...#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 5, type: 'coin' },
    { x: 7, y: 5, type: 'coin' },
    { x: 3, y: 7, type: 'coin' },
    { x: 7, y: 7, type: 'gem' },
  ],
  hidden: [{ x: 3, y: 3, type: 'crystalBlue' }],
  enemies: [
    { x: 7, y: 8, type: 'ghost' },
    { x: 10, y: 3, type: 'goblin', facing: -1 },
  ],
  portals: [],
});

const ROOM_11: RoomData = parseRoom({
  id: 11,
  name: 'Gemini 3 - The Cascade',
  theme: 2,
  spawnFacing: 1,
  rows: [
    '###############',
    '#T............#',  // T = secret at (1,1)
    '#.#...........#',  // wall column (2, 2)
    '#.#...........#',
    '#.#.#.........#',  // column (4, 4)
    '#.#.#.........#',
    '#.#.#.#.K.....#',  // K at (8,6), column (6, 6)
    '#.#.#.#.#.....#',  // column (8, 7)
    '#.#.#.#.#.....#',
    '#.#.#.#.#.#...#',  // column (10, 9)
    '#.............#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 3, y: 4, type: 'coin' },
    { x: 5, y: 6, type: 'coin' },
    { x: 9, y: 7, type: 'coin' },
    { x: 11, y: 9, type: 'gem' },
    { x: 7, y: 11, type: 'jarOrange' },
  ],
  hidden: [],
  enemies: [
    { x: 10, y: 3, type: 'demonhead' },
    { x: 5, y: 10, type: 'goblin' },
  ],
  portals: [],
});

const ROOM_12: RoomData = parseRoom({
  id: 12,
  name: 'Gemini 4 - The Twins Vault',
  theme: 2,
  spawnFacing: 1,
  rows: [
    '###############',
    '#.K...........#',  // K at (2,1) — hard to reach, up top
    '#.#...###.....#',  // platform (6-8, 2), column at (2, 2)
    '#.#...###.....#',
    '#.#...........#',
    '#.#.######....#',  // platform (4-9, 5), column continues
    '#.............#',
    '#.########....#',  // platform (2-9, 7)
    '#.............#',
    '#.###.........#',  // platform (2-4, 9)
    '#.###.........#',
    '#S...........D#',
    '###############',
  ],
  items: [
    { x: 4, y: 5, type: 'coin' },
    { x: 7, y: 2, type: 'coin' },
    { x: 3, y: 9, type: 'gem' },
    { x: 7, y: 7, type: 'coin' },
    { x: 12, y: 5, type: 'sealConstellation', hidden: true },
  ],
  hidden: [],
  enemies: [
    { x: 7, y: 6, type: 'wizard' },
    { x: 5, y: 9, type: 'goblin' },
  ],
  portals: [
    { x: 13, y: 6, type: 'demonhead', max: 2, cooldown: 4500 },
  ],
});

export const WORLD_ROOMS_1_TO_3: RoomData[] = [
  ROOM_1, ROOM_2, ROOM_3, ROOM_4,
  ROOM_5, ROOM_6, ROOM_7, ROOM_8,
  ROOM_9, ROOM_10, ROOM_11, ROOM_12,
];
