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
  // Drop shadow
  scene.add.text(GAME_W / 2 + 2, y + 2, s, {
    fontFamily: FONT, fontSize: '20px', color: '#000000'
  }).setOrigin(0.5).setAlpha(0.6);
  const t = scene.add
    .text(GAME_W / 2, y, s, {
      fontFamily: FONT,
      fontSize: '20px',
      color: '#ffd84a',
      stroke: '#5d2e99',
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  return t;
}

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
  scene.add.rectangle(x, y, w + 4, h + 4, 0x000000, 0.8).setOrigin(0.5);
  scene.add.rectangle(x, y, w, h, 0x0e0e28, 0.95).setOrigin(0.5);
  const g = scene.add.graphics();
  g.lineStyle(2, 0x8c4bd9, 0.8);
  g.strokeRect(x - w / 2, y - h / 2, w, h);
  g.lineStyle(1, 0xffc83c, 0.3);
  g.strokeRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6);
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
