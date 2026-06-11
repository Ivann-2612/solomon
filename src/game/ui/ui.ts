import * as Phaser from 'phaser';
import { GAME_W } from '../constants';
import { Audio } from '../audio/audio';

export const FONT = 'monospace';

export function txt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  s: string,
  size = 10,
  color = '#f4f4f4'
) {
  return scene.add
    .text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color })
    .setOrigin(0.5);
}

export function title(scene: Phaser.Scene, y: number, s: string) {
  const t = scene.add
    .text(GAME_W / 2, y, s, {
      fontFamily: FONT,
      fontSize: '20px',
      color: '#ffc83c',
      stroke: '#5d2e99',
      strokeThickness: 4
    })
    .setOrigin(0.5);
  return t;
}

export interface MenuItem {
  label: string;
  action: () => void;
}

export class Menu {
  private items: MenuItem[];
  private texts: Phaser.GameObjects.Text[] = [];
  private idx = 0;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, gap: number, items: MenuItem[], size = 12) {
    this.scene = scene;
    this.items = items;
    items.forEach((it, i) => {
      const t = scene.add
        .text(x, y + i * gap, it.label, {
          fontFamily: FONT,
          fontSize: `${size}px`,
          color: '#f4f4f4'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerover', () => this.select(i));
      t.on('pointerdown', () => {
        this.select(i);
        this.activate();
      });
      this.texts.push(t);
    });
    this.select(0);

    const kb = scene.input.keyboard;
    if (kb) {
      kb.on('keydown-UP', () => this.select((this.idx + items.length - 1) % items.length));
      kb.on('keydown-DOWN', () => this.select((this.idx + 1) % items.length));
      kb.on('keydown-ENTER', () => this.activate());
      kb.on('keydown-SPACE', () => this.activate());
      kb.on('keydown-Z', () => this.activate());
    }
  }

  setLabel(i: number, label: string) {
    this.items[i].label = label;
    this.texts[i].setText(label);
    this.select(this.idx);
  }

  select(i: number) {
    this.idx = i;
    this.texts.forEach((t, j) => {
      t.setColor(j === i ? '#ffc83c' : '#f4f4f4');
      t.setText((j === i ? '> ' : '  ') + this.items[j].label + (j === i ? ' <' : '  '));
    });
    Audio.sfx('ui');
  }

  activate() {
    Audio.sfx('ui');
    this.items[this.idx].action();
  }
}
