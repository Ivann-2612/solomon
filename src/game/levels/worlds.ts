import { ZODIAC, STAGES_PER_WORLD } from '../constants';
import type { BossType } from '@/types';

export const SECRET_WORLD = 12;
export const SOLOMON_WORLD = 13;

export function worldOfLevel(id: number): number {
  if (id <= 48) return Math.floor((id - 1) / STAGES_PER_WORLD);
  if (id <= 63) return SECRET_WORLD;
  return SOLOMON_WORLD;
}

export function stageOfLevel(id: number): number {
  if (id <= 48) return ((id - 1) % STAGES_PER_WORLD) + 1;
  if (id <= 63) return id - 48;
  return 1;
}

export function levelName(id: number): string {
  if (id <= 48) return `${ZODIAC[worldOfLevel(id)]} ${stageOfLevel(id)}`;
  if (id <= 63) return `Secret ${id - 48}`;
  return 'Solomon Chamber';
}

// One boss every 3 worlds -> last stage of worlds 3, 6, 9, 12 (levels 12/24/36/48)
export function bossOfLevel(id: number): BossType | undefined {
  if (id === 12) return 'flame';
  if (id === 24) return 'colossus';
  if (id === 36) return 'serpent';
  if (id === 48) return 'celestial';
  if (id === 64) return 'king';
  return undefined;
}

export const BOSS_NAMES: Record<BossType, string> = {
  flame: 'Flame Guardian',
  colossus: 'Stone Colossus',
  serpent: 'Shadow Serpent',
  celestial: 'Celestial Demon',
  king: 'King of Darkness'
};

// secret level unlocked by collecting the seal of its world (49..60),
// bonus secrets 61/62/63 unlock at 4/8/12 collected seals.
export function secretLevelOfWorld(world: number): number {
  return 49 + world;
}
