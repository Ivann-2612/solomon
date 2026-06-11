import { describe, it, expect } from 'vitest';
import { BonusCounter, gdv } from '@/game/systems/scoring';

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
  it('edlem resets to 50000 when at least half, else 25000, and doubles countdown', () => {
    const b = new BonusCounter();
    for (let i = 0; i < 3000; i++) b.tick(); // 50000-30000=20000 < 25000
    b.applyEdlem(); expect(b.value).toBe(25000); expect(b.tickAmount).toBe(20);
    const c = new BonusCounter();
    c.applyEdlem(); expect(c.value).toBe(50000);
  });
  it('hourglass sets 5000 / blue 10000', () => {
    const b = new BonusCounter();
    b.applyHourglass(false); expect(b.value).toBe(5000);
    b.applyHourglass(true); expect(b.value).toBe(10000);
  });
  it('expires at 0 and never goes negative', () => {
    const b = new BonusCounter();
    b.applyHourglass(false);
    for (let i = 0; i < 501; i++) b.tick();
    expect(b.value).toBe(0); expect(b.expired).toBe(true);
  });
});

describe('gdv', () => {
  it('grades from D to SS', () => {
    expect(gdv(0, 0, 0, 0, 0).grade).toBe('D');
    expect(gdv(49, 15, 100, 50000, 500000).grade).toBe('SS');
  });
});
