import type { SaveSlot } from '@/types';

// GDV = Levels + Secrets + Items + Time + Score
export interface GdvResult {
  levels: number;
  secrets: number;
  items: number;
  time: number;
  score: number;
  gdv: number;
  grade: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
}

export function computeGDV(slot: SaveSlot, timeBonusTotal: number): GdvResult {
  const levels = slot.completedStages.length * 1000;
  const secrets = slot.secretsFound * 1500;
  const items = slot.itemsCollected * 100;
  const time = Math.floor(timeBonusTotal);
  const score = slot.totalScore;
  const gdv = levels + secrets + items + time + score;
  let grade: GdvResult['grade'] = 'D';
  if (gdv >= 250000) grade = 'SS';
  else if (gdv >= 180000) grade = 'S';
  else if (gdv >= 120000) grade = 'A';
  else if (gdv >= 70000) grade = 'B';
  else if (gdv >= 30000) grade = 'C';
  return { levels, secrets, items, time, score, gdv, grade };
}
