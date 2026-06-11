// NOTE: computeGDV (old export) was removed in this rewrite.
// MenuScenes.ts imports computeGDV — that import is a KNOWN BREAKAGE handled in a later task.

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

  applyMultiplier(m: 2 | 5) {
    this.v *= m;
    this.tickAmount *= m;
  }

  applyEdlem() {
    this.v = this.v >= 25000 ? 50000 : 25000;
    this.tickAmount *= 2;
  }

  applyHourglass(blue: boolean) {
    this.v = blue ? 10000 : 5000;
  }
}

export function gdv(
  levels: number,
  secrets: number,
  items: number,
  bonusLeft: number,
  score: number
): { value: number; grade: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' } {
  const v =
    levels * 100 +
    secrets * 300 +
    items * 10 +
    Math.floor(bonusLeft / 100) +
    Math.floor(score / 100);
  const grade =
    v >= 8000 ? 'SS' :
    v >= 6000 ? 'S' :
    v >= 4500 ? 'A' :
    v >= 3000 ? 'B' :
    v >= 1500 ? 'C' : 'D';
  return { value: v, grade };
}
