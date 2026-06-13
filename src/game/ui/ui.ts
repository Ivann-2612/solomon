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
  // Deep shadow
  scene.add.text(GAME_W / 2 + 2, y + 3, s, {
    fontFamily: FONT, fontSize: '26px', color: '#000000'
  }).setOrigin(0.5).setAlpha(0.75);
  const t = scene.add.text(GAME_W / 2, y, s, {
    fontFamily: FONT,
    fontSize: '26px',
    color: '#ffe55a',
    stroke: '#4a1a88',
    strokeThickness: 5,
  }).setOrigin(0.5);
  return t;
}

/** Glassmorphism-style panel: dark semi-transparent bg + gradient border. */
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
  const g = scene.add.graphics();
  // Shadow layer
  g.fillStyle(0x000000, 0.5);
  g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 4, w, h, 8);
  // Main panel
  g.fillStyle(0x080820, 0.92);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
  // Subtle inner highlight (top edge)
  g.fillStyle(0xffffff, 0.04);
  g.fillRoundedRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, 6, 4);
  // Gold outer border
  g.lineStyle(1.5, 0xffc83c, 0.6);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
  // Purple inner border
  g.lineStyle(1, 0x8c4bd9, 0.35);
  g.strokeRoundedRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, h - 4, 6);
}

export interface MenuItem {
  label: string;
  action: () => void;
}

export class Menu {
  private items: MenuItem[];
  private texts: Phaser.GameObjects.Text[] = [];
  private highlights: Phaser.GameObjects.Graphics[] = [];
  private idx = 0;
  private scene: Phaser.Scene;
  private x: number;
  private gap: number;
  private size: number;

  constructor(scene: Phaser.Scene, x: number, y: number, gap: number, items: MenuItem[], size = 14) {
    this.scene = scene;
    this.items = items;
    this.x = x;
    this.gap = gap;
    this.size = size;

    items.forEach((it, i) => {
      // Highlight pill behind selected item
      const hl = scene.add.graphics();
      this.highlights.push(hl);

      const t = scene.add
        .text(x, y + i * gap, it.label, {
          fontFamily: FONT,
          fontSize: `${size}px`,
          color: '#c8c8e0',
          padding: { x: 12, y: 4 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-80, -12, 160, 24), hitAreaCallback: Phaser.Geom.Rectangle.Contains });

      t.on('pointerover', () => this.select(i));
      t.on('pointerdown', () => { this.select(i); this.activate(); });
      this.texts.push(t);
    });
    this.select(0);

    const kb = scene.input.keyboard;
    if (kb) {
      kb.on('keydown-UP',    () => this.select((this.idx + items.length - 1) % items.length));
      kb.on('keydown-DOWN',  () => this.select((this.idx + 1) % items.length));
      kb.on('keydown-ENTER', () => this.activate());
      kb.on('keydown-SPACE', () => this.activate());
      kb.on('keydown-Z',     () => this.activate());
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
      const active = j === i;
      t.setColor(active ? '#ffe55a' : '#c8c8e0');
      t.setStroke(active ? '#4a1a88' : 'transparent', active ? 2 : 0);

      // Redraw highlight pill
      const hl = this.highlights[j];
      hl.clear();
      if (active) {
        const tx = t.x - t.width / 2 - 10;
        const ty = t.y - this.size / 2 - 5;
        hl.fillStyle(0x3a1a6a, 0.75);
        hl.fillRoundedRect(tx, ty, t.width + 20, this.size + 10, 5);
        hl.lineStyle(1, 0xffc83c, 0.45);
        hl.strokeRoundedRect(tx, ty, t.width + 20, this.size + 10, 5);
      }
    });
    Audio.sfx('ui');
  }

  activate() {
    Audio.sfx('ui');
    this.items[this.idx].action();
  }
}
