import { describe, it, expect } from 'vitest';
import { parseRoom } from '@/game/levels/parseRoom';
import { Tile } from '@/types';

const rows = [
  '###############',
  '#.............#',
  '#.............#',
  '#....K........#',
  '#...BBB.......#',
  '#.............#',
  '#.........D...#',
  '#.............#',
  '#.............#',
  '#S............#',
  '#BBBB.....BBBB#',
  '#.............#',
  '###############'
];

describe('parseRoom', () => {
  it('parses grid, spawn, key, door', () => {
    const r = parseRoom({ id: 1, name: 'Aries 1', theme: 0, rows, items: [], hidden: [], enemies: [], portals: [] });
    expect(r.grid.length).toBe(13);
    expect(r.grid[0].length).toBe(15);
    expect(r.grid[0][0]).toBe(Tile.Stone);
    expect(r.grid[4][4]).toBe(Tile.Magic);
    expect(r.spawn).toEqual({ x: 1, y: 9, facing: 1 });
    expect(r.key).toEqual({ x: 5, y: 3 });
    expect(r.door).toEqual({ x: 10, y: 6 });
  });
  it('throws on wrong dimensions or missing S/K/D', () => {
    expect(() => parseRoom({ id: 1, name: 'x', theme: 0, rows: ['###'], items: [], hidden: [], enemies: [], portals: [] })).toThrow();
  });
});
