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
  id <= 48
    ? `${ZODIAC[constellationOfRoom(id)]} ${((id - 1) % 4) + 1}`
    : id === 49
    ? 'Mystic Chamber'
    : id <= 112
    ? `${ZODIAC[id - 101]} Bonus`
    : id === 201
    ? 'Page of Time'
    : id === 202
    ? 'Page of Space'
    : 'Princess Room';

export const wingsTarget = (room: number) => room + 6;
export const WINGS_ROOMS = [7, 15, 23, 31, 39];

export interface ProgressCtx {
  seals: number;
  sign: boolean;
  sealHere: boolean;
}

export function nextRoom(cur: number, ctx: ProgressCtx): number {
  // Return from bonus rooms: bonus room N (101..112) -> after its 4th stage
  if (cur >= 101 && cur <= 112) return (cur - 100) * 4 + 1;
  if (cur === 201) return 21;
  if (cur === 202) return 45;
  if (cur === 203) return 49;

  // Special unlock checks (order matters: check specials before bonus)
  if (cur === 20 && ctx.seals >= 4 && ctx.sign) return 201;
  if (cur === 44 && ctx.seals >= 6 && ctx.sign) return 202;
  if (cur === 48 && ctx.seals >= 8) return 203;

  // Bonus room: completing the 4th room of a constellation with sealHere
  if (cur % 4 === 0 && cur <= 48 && ctx.sealHere) return 100 + cur / 4;

  return cur + 1;
}

export type Ending = 'best' | 'princess' | 'pages' | 'normal';

export function endingFor(s: {
  princess: boolean;
  pageTime: boolean;
  pageSpace: boolean;
}): Ending {
  if (s.princess && s.pageTime && s.pageSpace) return 'best';
  if (s.princess) return 'princess';
  if (s.pageTime && s.pageSpace) return 'pages';
  return 'normal';
}
