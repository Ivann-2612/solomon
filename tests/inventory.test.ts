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
