# Mystic Key Classic Remake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Mystic Key into a faithful recreation of the 1986 classic: SK mechanics (instant death, bonus countdown, bell/fairy, fireball inventory, head-bump), SK item set, 64 hand-transcribed rooms, rotating wall themes with ornate frame, top HUD + bottom status bar, demo mode, 4 endings. Branding stays "Mystic Key".

**Architecture:** In-place transformation of the existing Next.js 15 + Phaser 3 codebase. Pure logic (room parsing, items, scoring, unlock rules) gets unit tests via vitest; Phaser scenes are smoke-tested via the existing Playwright-driving approach. Levels move from procedural generation to static ASCII room data in `src/game/levels/rooms/`.

**Tech Stack:** Next.js 15, TypeScript, Phaser 3.90, Zustand, vitest (new dev-dep), tsx.

**Spec:** `docs/superpowers/specs/2026-06-11-solomons-key-remake-design.md`

---

### Task 1: Test infrastructure (vitest)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1:** `npm install -D vitest`
- [ ] **Step 2:** Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
});
```

- [ ] **Step 3:** Add to `package.json` scripts: `"test": "vitest run"`.
- [ ] **Step 4:** Run `npm test` — expect "no test files found" exit 0 (or trivially pass).
- [ ] **Step 5:** Commit: `chore: add vitest`

---

### Task 2: New types

**Files:**
- Modify: `src/types/index.ts` (replace ItemType/EnemyType, add RoomData)
- Test: `tests/types.test.ts` (compile-only usage via room fixtures in later tasks; no dedicated test here)

- [ ] **Step 1:** Replace enemy/item types and add room types in `src/types/index.ts`:

```ts
export type EnemyType =
  | 'goblin'      // patrols ledges
  | 'saramandor'  // walks, breathes fire toward Dana
  | 'demonhead'   // flies straight
  | 'ghost'       // passes through blocks
  | 'gargoyle'    // stationary statue, shoots projectiles
  | 'wizard';     // teleports + casts

export type ItemType =
  | 'bell' | 'fairy'
  | 'jarBlue' | 'jarOrange' | 'jarUpgrade'
  | 'crystalBlue' | 'crystalOrange'
  | 'medEdlem' | 'hourglass' | 'hourglassBlue' | 'medMeltona'
  | 'wings'
  | 'sealSolomon' | 'sealConstellation' | 'signConstellation'
  | 'coin' | 'jewel' | 'diamondBlue' | 'diamondOrange'
  | 'potionX2' | 'potionX5'
  | 'pageTime' | 'pageSpace' | 'princess' | 'key';

export interface HiddenItemSpec { x: number; y: number; type: ItemType; }

export interface RoomData {
  id: number;            // 1..49 main, 101..112 bonus, 201/202 pages, 203 princess
  name: string;
  theme: number;         // wall theme index, rotates per constellation
  grid: number[][];      // [13][15] Tile values
  spawn: { x: number; y: number; facing: 1 | -1 };
  key: { x: number; y: number };
  door: { x: number; y: number };
  items: ItemSpec[];          // visible items
  hidden: HiddenItemSpec[];   // revealed when their block is destroyed
  enemies: EnemySpec[];
  portals: PortalSpec[];
}
```

Keep `Tile`, `ItemSpec {x,y,type,hidden?}`, `EnemySpec` (add `facing?: 1|-1`), `PortalSpec` unchanged otherwise. Update `SaveSlot`: replace `seals: number[]` with `solomonSeals: number[]` (0..7) and `constellationSeals: number[]` (0..11); add `fairies: number`, `room: number` (current furthest room 1..49), `wingsSkipsUsed: number[]`.

- [ ] **Step 2:** `npx tsc --noEmit` — expect errors in dependent files (generator, GameScene…). That's fine; they get fixed in later tasks. Note the error list.
- [ ] **Step 3:** Commit: `feat: SK types (enemies, items, RoomData, save fields)`

---

### Task 3: ASCII room format + parser (TDD)

**Files:**
- Create: `src/game/levels/parseRoom.ts`
- Test: `tests/parseRoom.test.ts`

Legend: `#` stone, `B` orange block, `.` empty, `S` spawn, `K` key, `D` door. Items/enemies/hidden are listed separately by grid coordinates (clearer than cramming into ASCII).

- [ ] **Step 1:** Write failing test `tests/parseRoom.test.ts`:

```ts
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
    expect(r.door).toEqual({ x: 11, y: 6 });
  });
  it('throws on wrong dimensions or missing S/K/D', () => {
    expect(() => parseRoom({ id: 1, name: 'x', theme: 0, rows: ['###'], items: [], hidden: [], enemies: [], portals: [] })).toThrow();
  });
});
```

- [ ] **Step 2:** Run `npm test` — expect FAIL (module not found).
- [ ] **Step 3:** Implement `src/game/levels/parseRoom.ts`:

```ts
import { Tile } from '@/types';
import type { RoomData, ItemSpec, HiddenItemSpec, EnemySpec, PortalSpec } from '@/types';
import { GRID_W, GRID_H } from '../constants';

export interface RoomDef {
  id: number; name: string; theme: number;
  rows: string[];
  items: ItemSpec[]; hidden: HiddenItemSpec[];
  enemies: EnemySpec[]; portals: PortalSpec[];
  spawnFacing?: 1 | -1;
}

const CH: Record<string, Tile> = { '#': Tile.Stone, B: Tile.Magic, '.': Tile.Empty, S: Tile.Empty, K: Tile.Empty, D: Tile.Empty };

export function parseRoom(def: RoomDef): RoomData {
  if (def.rows.length !== GRID_H) throw new Error(`room ${def.id}: ${def.rows.length} rows, want ${GRID_H}`);
  let spawn, key, door;
  const grid: number[][] = [];
  for (let y = 0; y < GRID_H; y++) {
    const row = def.rows[y];
    if (row.length !== GRID_W) throw new Error(`room ${def.id} row ${y}: ${row.length} cols, want ${GRID_W}`);
    grid.push([...row].map((c, x) => {
      if (!(c in CH)) throw new Error(`room ${def.id}: bad char '${c}' at ${x},${y}`);
      if (c === 'S') spawn = { x, y, facing: def.spawnFacing ?? 1 };
      if (c === 'K') key = { x, y };
      if (c === 'D') door = { x, y };
      return CH[c];
    }));
  }
  if (!spawn || !key || !door) throw new Error(`room ${def.id}: missing S/K/D`);
  return { id: def.id, name: def.name, theme: def.theme, grid, spawn, key, door,
    items: def.items, hidden: def.hidden, enemies: def.enemies, portals: def.portals };
}
```

- [ ] **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** Commit: `feat: ASCII room parser`

---

### Task 4: Room registry, progression and unlock rules (TDD)

**Files:**
- Create: `src/game/levels/registry.ts`
- Create: `src/game/levels/rooms/index.ts` (starts with placeholder rooms 1–49 generated from a trivial template so the game runs before transcription)
- Test: `tests/registry.test.ts`
- Delete (in Task 12 cleanup): `src/game/levels/generator.ts`, `src/game/levels/worlds.ts`

Progression rules (from spec):
- Main flow is linear: room 1 → 49. Room 49 = final room ("Mystic Chamber" in UI).
- Constellation seal collected in room 4n → bonus room 100+n plays after room 4n.
- Wings in rooms 7/15/23/31/39 → jump to room +5 (e.g. 7→12... actually skip the next five rooms: 7→13). Use `current + 6`? No: "skip next 5 rooms" = from room 7 you go to room 13. Implement `wingsTarget(room) = room + 6`.
- Page of Time: after room 20 if ≥4 Solomon seals and sign collected in room 20 → room 201.
- Page of Space: after room 44 if ≥6 seals and sign in room 44 → room 202.
- Princess Room: after room 48 if all 8 seals → room 203, then room 49.
- Ending: best (princess + both pages) / princess / pages / normal.

- [ ] **Step 1:** Write failing test `tests/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { nextRoom, endingFor, wingsTarget, constellationOfRoom } from '@/game/levels/registry';

describe('progression', () => {
  it('linear next room', () => {
    expect(nextRoom(1, { seals: 0, sign: false, sealHere: false })).toBe(2);
  });
  it('bonus room after collecting constellation seal in 4th room', () => {
    expect(nextRoom(4, { seals: 0, sign: false, sealHere: true })).toBe(101);
    expect(nextRoom(101, { seals: 0, sign: false, sealHere: false })).toBe(5);
  });
  it('page of time after room 20 with 4 seals + sign', () => {
    expect(nextRoom(20, { seals: 4, sign: true, sealHere: false })).toBe(201);
    expect(nextRoom(201, { seals: 4, sign: false, sealHere: false })).toBe(21);
    expect(nextRoom(20, { seals: 3, sign: true, sealHere: false })).toBe(21);
  });
  it('page of space after room 44 with 6 seals + sign', () => {
    expect(nextRoom(44, { seals: 6, sign: true, sealHere: false })).toBe(202);
  });
  it('princess after 48 with 8 seals', () => {
    expect(nextRoom(48, { seals: 8, sign: false, sealHere: false })).toBe(203);
    expect(nextRoom(203, { seals: 8, sign: false, sealHere: false })).toBe(49);
    expect(nextRoom(48, { seals: 7, sign: false, sealHere: false })).toBe(49);
  });
  it('wings skip', () => { expect(wingsTarget(7)).toBe(13); });
  it('constellation index', () => {
    expect(constellationOfRoom(1)).toBe(0);
    expect(constellationOfRoom(48)).toBe(11);
  });
  it('endings', () => {
    expect(endingFor({ princess: true, pageTime: true, pageSpace: true })).toBe('best');
    expect(endingFor({ princess: true, pageTime: false, pageSpace: false })).toBe('princess');
    expect(endingFor({ princess: false, pageTime: true, pageSpace: true })).toBe('pages');
    expect(endingFor({ princess: false, pageTime: false, pageSpace: false })).toBe('normal');
  });
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement `src/game/levels/registry.ts`:

```ts
import type { RoomData } from '@/types';
import { ROOMS } from './rooms';
import { ZODIAC } from '../constants';

export function getRoom(id: number): RoomData {
  const r = ROOMS.find((r) => r.id === id);
  if (!r) throw new Error(`room ${id} missing`);
  return r;
}

export const constellationOfRoom = (id: number) => Math.min(11, Math.floor((id - 1) / 4));
export const roomTitle = (id: number) =>
  id <= 48 ? `${ZODIAC[constellationOfRoom(id)]} ${((id - 1) % 4) + 1}`
  : id === 49 ? 'Mystic Chamber'
  : id <= 112 ? `${ZODIAC[id - 101]} Bonus`
  : id === 201 ? 'Page of Time' : id === 202 ? 'Page of Space' : 'Princess Room';

export const wingsTarget = (room: number) => room + 6;
export const WINGS_ROOMS = [7, 15, 23, 31, 39];

export interface ProgressCtx { seals: number; sign: boolean; sealHere: boolean; }

export function nextRoom(cur: number, ctx: ProgressCtx): number {
  if (cur >= 101 && cur <= 112) return (cur - 100) * 4 + 1; // back after bonus
  if (cur === 201) return 21;
  if (cur === 202) return 45;
  if (cur === 203) return 49;
  if (cur === 20 && ctx.seals >= 4 && ctx.sign) return 201;
  if (cur === 44 && ctx.seals >= 6 && ctx.sign) return 202;
  if (cur === 48 && ctx.seals >= 8) return 203;
  if (cur % 4 === 0 && cur <= 48 && ctx.sealHere) return 100 + cur / 4;
  return cur + 1;
}

export type Ending = 'best' | 'princess' | 'pages' | 'normal';
export function endingFor(s: { princess: boolean; pageTime: boolean; pageSpace: boolean }): Ending {
  if (s.princess && s.pageTime && s.pageSpace) return 'best';
  if (s.princess) return 'princess';
  if (s.pageTime && s.pageSpace) return 'pages';
  return 'normal';
}
```

- [ ] **Step 4:** Create `src/game/levels/rooms/index.ts` exporting `ROOMS: RoomData[]` built by `parseRoom` from a placeholder template (simple solvable room: floor, key on a 2-block pillar, door right side) repeated for ids 1–49, 101–112, 201–203, with `theme: constellationOfRoom(id) % 4`. Real layouts replace these in Tasks 13–16.
- [ ] **Step 5:** `npm test` — PASS. Commit: `feat: room registry, progression, endings`

---

### Task 5: Bonus counter scoring (TDD)

**Files:**
- Rewrite: `src/game/systems/scoring.ts`
- Test: `tests/scoring.test.ts`

- [ ] **Step 1:** Failing test:

```ts
import { describe, it, expect } from 'vitest';
import { BonusCounter, POINTS } from '@/game/systems/scoring';

describe('BonusCounter', () => {
  it('starts at 50000 and ticks down 10 per tick', () => {
    const b = new BonusCounter();
    b.tick(); expect(b.value).toBe(49990);
  });
  it('multiplier x2 doubles value and tick rate', () => {
    const b = new BonusCounter();
    b.applyMultiplier(2);
    expect(b.value).toBe(100000);
    b.tick(); expect(b.value).toBe(99980);
  });
  it('edlem resets to 50000 (full) and speeds countdown', () => {
    const b = new BonusCounter();
    for (let i = 0; i < 3000; i++) b.tick();
    b.applyEdlem(); expect(b.value).toBe(50000); expect(b.tickAmount).toBe(20);
  });
  it('hourglass sets 5000 / blue 10000', () => {
    const b = new BonusCounter();
    b.applyHourglass(false); expect(b.value).toBe(5000);
    b.applyHourglass(true); expect(b.value).toBe(10000);
  });
  it('expires at 0', () => {
    const b = new BonusCounter();
    (b as any).v = 10; b.tick(); b.tick();
    expect(b.value).toBe(0); expect(b.expired).toBe(true);
  });
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement:

```ts
export const POINTS = {
  coin: 100, jewel: 500, diamond: 1000, fairy: 1000, bell: 200,
  enemyFireball: 300, key: 100, sealSolomon: 5000, sealConstellation: 2000,
  jar: 500, crystal: 800, page: 10000
};

export class BonusCounter {
  private v = 50000;
  tickAmount = 10;
  get value() { return this.v; }
  get expired() { return this.v <= 0; }
  tick() { this.v = Math.max(0, this.v - this.tickAmount); }
  applyMultiplier(m: 2 | 5) { this.v *= m; this.tickAmount *= m; }
  applyEdlem() { this.v = this.v >= 25000 ? 50000 : 25000; this.tickAmount *= 2; }
  applyHourglass(blue: boolean) { this.v = blue ? 10000 : 5000; }
}

// GDV: keep existing formula (levels+secrets+items+time+score), grade D..SS
export function gdv(levels: number, secrets: number, items: number, bonusLeft: number, score: number) {
  const v = levels * 100 + secrets * 300 + items * 10 + Math.floor(bonusLeft / 100) + Math.floor(score / 100);
  const grade = v >= 8000 ? 'SS' : v >= 6000 ? 'S' : v >= 4500 ? 'A' : v >= 3000 ? 'B' : v >= 1500 ? 'C' : 'D';
  return { value: v, grade };
}
```

Tick cadence: GameScene calls `tick()` every 120 ms (≈7–8 frames at 60fps, like the original).

- [ ] **Step 4:** `npm test` — PASS. Commit: `feat: SK bonus counter + GDV`

---

### Task 6: Fireball inventory + fairy/lives logic (TDD)

**Files:**
- Create: `src/game/systems/inventory.ts`
- Test: `tests/inventory.test.ts`

- [ ] **Step 1:** Failing test:

```ts
import { describe, it, expect } from 'vitest';
import { Inventory } from '@/game/systems/inventory';

describe('Inventory', () => {
  it('starts empty, blue jar adds normal fireball (max 3 base)', () => {
    const inv = new Inventory();
    expect(inv.shoot()).toBeNull();
    inv.addJar('blue'); inv.addJar('blue'); inv.addJar('blue'); inv.addJar('blue');
    expect(inv.fireballs.length).toBe(3);
    expect(inv.shoot()).toBe('normal');
    expect(inv.fireballs.length).toBe(2);
  });
  it('orange jar adds super; upgrade converts next normal to super', () => {
    const inv = new Inventory();
    inv.addJar('blue'); inv.addJar('upgrade');
    expect(inv.shoot()).toBe('super');
  });
  it('crystals extend range, reset on death', () => {
    const inv = new Inventory();
    expect(inv.rangeTiles).toBe(3);
    inv.addCrystal('blue'); expect(inv.rangeTiles).toBe(3.5);
    inv.addCrystal('orange'); expect(inv.rangeTiles).toBe(5.5);
    inv.onDeath(); expect(inv.rangeTiles).toBe(3);
  });
  it('10 fairies = extra life', () => {
    const inv = new Inventory();
    let lives = 0; inv.onExtraLife = () => lives++;
    for (let i = 0; i < 10; i++) inv.addFairy();
    expect(lives).toBe(1); expect(inv.fairies).toBe(10);
  });
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement:

```ts
export type FireballKind = 'normal' | 'super';

export class Inventory {
  fireballs: FireballKind[] = [];
  fairies = 0;
  rangeTiles = 3;
  onExtraLife: () => void = () => {};

  addJar(kind: 'blue' | 'orange' | 'upgrade') {
    if (kind === 'upgrade') {
      const i = this.fireballs.indexOf('normal');
      if (i >= 0) this.fireballs[i] = 'super';
      return;
    }
    if (this.fireballs.length < 3) this.fireballs.push(kind === 'blue' ? 'normal' : 'super');
  }
  shoot(): FireballKind | null { return this.fireballs.shift() ?? null; }
  addCrystal(kind: 'blue' | 'orange') { this.rangeTiles += kind === 'blue' ? 0.5 : 2; }
  addFairy() { this.fairies++; if (this.fairies % 10 === 0) this.onExtraLife(); }
  onDeath() { this.rangeTiles = 3; }
}
```

- [ ] **Step 4:** PASS. Commit: `feat: fireball inventory, crystals, fairy lives`

---

### Task 7: Player mechanics rewrite (instant death, head-bump, duck)

**Files:**
- Rewrite: `src/game/entities/Player.ts`
- Modify: `src/game/scenes/GameScene.ts` (death handling, block magic incl. diagonal-up, head-bump counter on blocks, duck input)
- Modify: `src/game/systems/input.ts` (add `duck` action: Down arrow / D-pad down)
- Modify: `src/game/constants.ts` (remove heart constants if any; fireball uses `Inventory.rangeTiles`)

No unit tests (Phaser physics); verified by Playwright smoke in Step 4.

- [ ] **Step 1:** Player.ts: keep run/jump (same constants); add `duck` state (half-height body, no movement while ducking); remove any HP/heart logic — expose `die()` that GameScene calls on enemy/projectile overlap; death plays animation then GameScene restarts the **whole room** (grid, items, enemies reset; score/seals/fairies persist; lives−1; game over at 0 lives → continue screen).
- [ ] **Step 2:** GameScene block magic: create/destroy targets the tile in front of Dana **or diagonally up-front** when holding Up (original rule). Head-bump: when Dana's head collides with an orange block from below, increment a per-block bump counter; at 2 destroy the block (same reveal-hidden-item path as magic destroy).
- [ ] **Step 3:** Hidden items: when an orange block is destroyed (magic or head-bump) and `room.hidden` has an entry at that tile, spawn that item there.
- [ ] **Step 4:** Smoke test with Playwright script (as used previously, port 3005): enter room 1, verify move/jump/duck, create+destroy block, head-bump a block twice, touch enemy → death → room restarts, lives 3→2. Screenshot each.
- [ ] **Step 5:** Commit: `feat: SK player mechanics (instant death, head-bump, duck, diagonal magic)`

---

### Task 8: Item system in GameScene

**Files:**
- Create: `src/game/systems/items.ts` (pure effect dispatch — testable)
- Modify: `src/game/scenes/GameScene.ts` (pickup wiring, fairy entity, bell→fairy release, wings transition)
- Test: `tests/items.test.ts`

- [ ] **Step 1:** Failing test for the pure dispatcher:

```ts
import { describe, it, expect } from 'vitest';
import { applyItem } from '@/game/systems/items';
import { Inventory } from '@/game/systems/inventory';
import { BonusCounter } from '@/game/systems/scoring';

function ctx() {
  return { inv: new Inventory(), bonus: new BonusCounter(), score: 0,
    flags: { bellRung: false, meltona: false, wings: false, sealHere: false, sign: false },
    seals: { solomon: new Set<number>(), constellation: new Set<number>() } };
}

describe('applyItem', () => {
  it('bell sets bellRung', () => { const c = ctx(); applyItem('bell', c, 0); expect(c.flags.bellRung).toBe(true); });
  it('jarBlue adds fireball', () => { const c = ctx(); applyItem('jarBlue', c, 0); expect(c.inv.fireballs).toEqual(['normal']); });
  it('hourglass sets bonus 5000', () => { const c = ctx(); applyItem('hourglass', c, 0); expect(c.bonus.value).toBe(5000); });
  it('potionX2 multiplies bonus', () => { const c = ctx(); applyItem('potionX2', c, 0); expect(c.bonus.value).toBe(100000); });
  it('sealSolomon recorded by index', () => { const c = ctx(); applyItem('sealSolomon', c, 3); expect(c.seals.solomon.has(3)).toBe(true); });
  it('wings sets flag', () => { const c = ctx(); applyItem('wings', c, 0); expect(c.flags.wings).toBe(true); });
  it('coin adds score', () => { const c = ctx(); applyItem('coin', c, 0); expect(c.score).toBe(100); });
});
```

- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement `applyItem(type, ctx, index)` switching over all ItemTypes from Task 2 (score items add POINTS, jars/crystals → inv, edlem/hourglass/potions → bonus, meltona/wings/bell/sign/seals → flags/sets, pageTime/pageSpace/princess recorded on ctx.flags). Diamond transform rule lives in GameScene: casting block magic on a tile occupied by `diamondBlue/diamondOrange` converts it into a jar pickup of same color instead of creating a block.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** GameScene wiring: bell pickup releases fairy sprite from the door (slow sine drift; touching it = `inv.addFairy()`); wings pickup ends room immediately with `wingsTarget`; key opens door (existing); door entry → bonus = end-of-room award, advance via `nextRoom`.
- [ ] **Step 6:** Commit: `feat: SK item system`

---

### Task 9: Enemies (SK set)

**Files:**
- Rewrite: `src/game/entities/Enemy.ts` (goblin, saramandor, demonhead, ghost, gargoyle, wizard)
- Modify: `src/game/scenes/GameScene.ts` (projectiles: saramandor flame, gargoyle shot, wizard cast; meltona effect kills saramandors+demonheads)
- Delete: `src/game/entities/Boss.ts` usage from GameScene (no SK bosses; room 49 uses dense enemy layout instead)

Behaviors:
- goblin: walks on platforms, turns at walls/edges.
- saramandor: walks through drops; when Dana is within 4 tiles in facing direction, stops and breathes a 1.5-tile flame (separate hitbox) for ~1 s. Drop direction = toward Dana.
- demonhead: flies horizontally straight, wraps/turns at walls.
- ghost: flies straight through blocks, only walls (border stone) turn it.
- gargoyle: static, fires a projectile horizontally every 3 s.
- wizard: every 4 s teleports to a random standable cell and casts a slow homing bolt.

- [ ] **Step 1:** Implement each type as a config-driven class in Enemy.ts (speed, flight, throughBlocks, shooter fields) + per-type `update()`.
- [ ] **Step 2:** Fireball interaction: normal fireball kills any enemy it touches then expires at range; super fireball pierces everything across the screen. Ghost immune to normal fireball (original rule: only super kills ghosts).
- [ ] **Step 3:** Spawn portals: keep existing portal system (max active + cooldown).
- [ ] **Step 4:** Playwright smoke: room with each enemy type (temporary test room), screenshot, verify movement and death-on-contact.
- [ ] **Step 5:** Commit: `feat: SK enemy set`

---

### Task 10: HUD, status bar, ornate frame, wall themes

**Files:**
- Modify: `src/game/assets/textures.ts` (new tile art: orange textured block, white block variant, stone wall per theme, frame + gargoyle statues, sparkle stars, item sprites for all ItemTypes, enemy sprites, fairy, Dana unchanged or re-skinned)
- Modify: `src/game/assets/palette.ts` (SK palette: tan/orange blocks, blue brick, grey brick, dark stone, gold)
- Modify: `src/game/scenes/GameScene.ts` (HUD top: "1P", score, "BONUS" counter digits; status bar bottom: "FAIRY..N", lives icons, "-DEMO-" slot; playfield framed)
- Modify: `src/game/constants.ts`: layout becomes top HUD 24px + playfield 15×24 wide; keep GAME_W=360, GAME_H=336 (24 HUD top + 288 grid… grid is 13×24=312; 312+24=336 — bottom bar overlays the bottom border row, as in the original where the frame is part of the visible field). Concretely: HUD strip y=0..23 drawn above, status bar drawn over y=312..335.

Themes (index → look): 0 dark stone + gargoyle statues, 1 blue brick, 2 grey brick, 3 sandstone. `theme = constellationOfRoom % 4`.

- [ ] **Step 1:** Extend `textures.ts` with `makeThemeTiles(theme)` producing wall/border tiles, and item/enemy sprite generators (pixel-drawn via existing canvas-texture approach in that file).
- [ ] **Step 2:** GameScene render: draw frame around playfield using theme border tiles + corner gargoyles (theme 0), sparkles at fixed pseudo-random positions.
- [ ] **Step 3:** HUD: top line `1P  <score>   BONUS <bonus>`; bottom `FAIRY..<n>  <life icons>  -DEMO- (attract only)`.
- [ ] **Step 4:** Playwright screenshots of rooms in all 4 themes; compare against reference screenshots by eye.
- [ ] **Step 5:** Commit: `feat: SK visual remaster (themes, frame, HUD)`

---

### Task 11: Screen flow — linear progression, demo mode, endings

**Files:**
- Modify: `src/game/scenes/MenuScenes.ts` (Title: attract/demo after 10 s idle — plays a scripted input sequence in room 1 with `-DEMO-` shown; any key returns to title)
- Modify: `src/game/scenes/FlowScenes.ts` (Start → room from save (or 1); world map becomes "LEVEL SELECT" of cleared rooms only; Level intro card "ROOM N — <title>"; Game Over → GDV + continue (3); ending scenes for normal/princess/pages/best → Credits)
- Modify: `src/game/systems/save.ts` (new SaveSlot fields from Task 2; autosave after each room)

- [ ] **Step 1:** Implement demo mode: record ~20 s of inputs for room 1 as a constant array `[frame, action, down][]`; DemoScene feeds them to the normal GameScene input layer; exits on any user input.
- [ ] **Step 2:** Wire `nextRoom`/`endingFor` from registry into room-complete handler; persist `solomonSeals/constellationSeals/fairies/room` in save.
- [ ] **Step 3:** Ending scenes: 4 variants of a simple text+art screen (princess sprite for princess/best).
- [ ] **Step 4:** Playwright: idle 11 s on title → demo runs with `-DEMO-`; complete room 1 → room 2; game over → GDV screen → continue.
- [ ] **Step 5:** Commit: `feat: linear flow, demo mode, 4 endings`

---

### Task 12: Remove generator, fix compile, validator update

**Files:**
- Delete: `src/game/levels/generator.ts`, `src/game/levels/worlds.ts`
- Modify: `src/game/levels/validator.ts` — validate RoomData: spawn/key/door reachable given block create/destroy ability (existing reachability extended: Dana can climb via created blocks, so reachability = flood fill where any empty cell adjacent-or-diagonal-up is reachable and orange blocks are traversable-after-destroy)
- Modify: `scripts/validate-levels.ts` to iterate `ROOMS`
- Test: `tests/validator.test.ts` (a solvable room passes; a key sealed in stone fails)

- [ ] **Step 1:** Write the two validator tests (use parseRoom fixtures), run — FAIL against new signature.
- [ ] **Step 2:** Implement `validateRoom(room: RoomData): string[]` (empty array = ok).
- [ ] **Step 3:** Delete generator/worlds; fix all imports (`npx tsc --noEmit` clean).
- [ ] **Step 4:** `npm test` + `npm run validate-levels` — all placeholder rooms pass.
- [ ] **Step 5:** Commit: `refactor: static rooms replace generator`

---

### Tasks 13–16: Transcribe the 64 real rooms (4 batches)

**Files:**
- Create: `src/game/levels/rooms/rooms01-16.ts` (Task 13: rooms 1–16 + bonus 101–104)
- Create: `src/game/levels/rooms/rooms17-32.ts` (Task 14: rooms 17–32 + bonus 105–108 + Page of Time 201)
- Create: `src/game/levels/rooms/rooms33-49.ts` (Task 15: rooms 33–49 + bonus 109–112 + Page of Space 202 + Princess 203)
- Modify: `src/game/levels/rooms/index.ts` each batch (replace placeholders)
- Task 16: full-game playthrough pass + fixes

Workflow per room (repeat for each):
1. Fetch the room's map: GameFAQs walkthrough text (`https://gamefaqs.gamespot.com/nes/570522-solomons-key/faqs/10324`) + VGMaps room images (`http://www.vgmaps.com/Atlas/NES/index.htm#SolomonsKey`) via WebFetch; transcribe layout to ASCII rows.
2. Add items (visible + hidden with exact block coordinates from the guide), enemies with positions/facing, Solomon seal locations (8 seals in their documented rooms), constellation seals in rooms 4/8/…/48, signs in rooms 20 and 44, wings in 7/15/23/31/39.
3. `npm run validate-levels` must pass for the room.
4. Playwright: load the room directly (dev-only `?room=N` query param — add in Task 13 Step 1), screenshot, eyeball against reference map.
5. Commit per batch: `feat: rooms 1-16 transcribed` etc.

- [ ] **Task 13 Step 1:** Add dev-only `?room=N` URL param that jumps straight into room N.
- [ ] **Task 13:** rooms 1–16 + bonus 101–104, per workflow above.
- [ ] **Task 14:** rooms 17–32 + bonus 105–108 + room 201.
- [ ] **Task 15:** rooms 33–49 + bonus 109–112 + rooms 202, 203.
- [ ] **Task 16:** Full playthrough (Playwright assisted + manual), fix layout/solvability bugs, verify all 4 endings reachable (use dev param + save editing), `npm run build` passes, final commit: `feat: faithful classic remake complete`.

---

## Verification (end of plan)

1. `npm test` — all unit tests pass.
2. `npm run validate-levels` — 64/64 rooms solvable.
3. `npx tsc --noEmit` — clean.
4. `npm run build` — static export builds.
5. Playwright full smoke: title → demo → start → clear room 1 → die → continue → level select.
6. Manual play on phone (touch controls) — user acceptance.
