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

  it('throws on wrong number of rows', () => {
    expect(() => parseRoom({ id: 1, name: 'x', theme: 0, rows: ['###'], items: [], hidden: [], enemies: [], portals: [] })).toThrow();
  });

  it('throws on wrong row width', () => {
    const badRows = rows.map((r, i) => i === 5 ? r.slice(0, 10) : r);
    expect(() => parseRoom({ id: 2, name: 'x', theme: 0, rows: badRows, items: [], hidden: [], enemies: [], portals: [] })).toThrow(/cols/);
  });

  it('throws on bad character', () => {
    const badRows = rows.map((r, i) => i === 5 ? r.slice(0, 14) + 'X' : r);
    expect(() => parseRoom({ id: 3, name: 'x', theme: 0, rows: badRows, items: [], hidden: [], enemies: [], portals: [] })).toThrow(/bad char/);
  });

  it('throws on missing K', () => {
    const noKey = rows.map(r => r.replace('K', '.'));
    expect(() => parseRoom({ id: 4, name: 'x', theme: 0, rows: noKey, items: [], hidden: [], enemies: [], portals: [] })).toThrow(/missing/);
  });

  it('throws on duplicate S', () => {
    // Replace first interior '.' in row 9 with another S (there is already S at col 1)
    const dupS = rows.map((r, i) => i === 9 ? '#SS...........#' : r);
    expect(() => parseRoom({ id: 5, name: 'x', theme: 0, rows: dupS, items: [], hidden: [], enemies: [], portals: [] })).toThrow(/duplicate S/);
  });
});
