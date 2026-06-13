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
