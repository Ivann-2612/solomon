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
