import type { ItemType } from '@/types';
import type { Inventory } from './inventory';
import { BonusCounter, POINTS } from './scoring';

export interface ItemFlags {
  bellRung: boolean;
  meltona: boolean;
  wings: boolean;
  sealHere: boolean;
  sign: boolean;
  pageTime?: boolean;
  pageSpace?: boolean;
  princess?: boolean;
}

export interface ItemCtx {
  inv: Inventory;
  bonus: BonusCounter;
  score: number;
  flags: ItemFlags;
  seals: { solomon: Set<number>; constellation: Set<number> };
}

/**
 * Pure item effect dispatch. Mutates ctx (inventory, bonus, flags, seals, score)
 * and returns the points awarded (also added to ctx.score).
 * `index` identifies the room/constellation for seal items.
 */
export function applyItem(type: ItemType, ctx: ItemCtx, index: number): number {
  let pts = 0;
  switch (type) {
    case 'coin':
      pts = POINTS.coin;
      break;
    case 'gem':
    case 'jewel':
      pts = POINTS.jewel;
      break;
    case 'diamondBlue':
    case 'diamondOrange':
      pts = POINTS.diamond;
      break;
    case 'fairy':
      ctx.inv.addFairy();
      pts = POINTS.fairy;
      break;
    case 'bell':
      ctx.flags.bellRung = true;
      pts = POINTS.bell;
      break;
    case 'key':
      pts = POINTS.key;
      break;
    case 'fire': // legacy alias of jarBlue
    case 'jarBlue':
      ctx.inv.addJar('blue');
      pts = POINTS.jar;
      break;
    case 'jarOrange':
      ctx.inv.addJar('orange');
      pts = POINTS.jar;
      break;
    case 'jarUpgrade':
      ctx.inv.addJar('upgrade');
      pts = POINTS.jar;
      break;
    case 'crystalBlue':
      ctx.inv.addCrystal('blue');
      pts = POINTS.crystal;
      break;
    case 'crystalOrange':
      ctx.inv.addCrystal('orange');
      pts = POINTS.crystal;
      break;
    case 'medEdlem':
      ctx.bonus.applyEdlem();
      break;
    case 'time': // legacy alias of hourglass
    case 'hourglass':
      ctx.bonus.applyHourglass(false);
      break;
    case 'hourglassBlue':
      ctx.bonus.applyHourglass(true);
      break;
    case 'potionX2':
      ctx.bonus.applyMultiplier(2);
      break;
    case 'potionX5':
      ctx.bonus.applyMultiplier(5);
      break;
    case 'medMeltona':
      ctx.flags.meltona = true;
      break;
    case 'wings':
      ctx.flags.wings = true;
      break;
    case 'signConstellation':
      ctx.flags.sign = true;
      break;
    case 'sealSolomon':
      ctx.seals.solomon.add(index);
      ctx.flags.sealHere = true;
      pts = POINTS.sealSolomon;
      break;
    case 'seal': // legacy alias of sealConstellation
    case 'sealConstellation':
      ctx.seals.constellation.add(index);
      ctx.flags.sealHere = true;
      pts = POINTS.sealConstellation;
      break;
    case 'pageTime':
      ctx.flags.pageTime = true;
      pts = POINTS.page;
      break;
    case 'pageSpace':
      ctx.flags.pageSpace = true;
      pts = POINTS.page;
      break;
    case 'princess':
      ctx.flags.princess = true;
      break;
    // legacy aliases with scene-level effects (lives/saves): no pure effect
    case 'life':
    case 'chest':
    case 'crown':
    case 'orb':
      break;
  }
  ctx.score += pts;
  return pts;
}
