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
    if (this.fireballs.length < 3) {
      this.fireballs.push(kind === 'blue' ? 'normal' : 'super');
    }
  }

  shoot(): FireballKind | null {
    return this.fireballs.shift() ?? null;
  }

  addCrystal(kind: 'blue' | 'orange') {
    this.rangeTiles += kind === 'blue' ? 0.5 : 2;
  }

  addFairy() {
    this.fairies++;
    if (this.fairies % 10 === 0) this.onExtraLife();
  }

  onDeath() {
    this.rangeTiles = 3;
  }
}
