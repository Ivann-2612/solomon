import * as Phaser from 'phaser';
import { GAME_W, GAME_H, START_LIVES, MAX_CONTINUES, ZODIAC } from '../constants';
import { txt, title, Menu, FONT } from '../ui/ui';
import { Audio } from '../audio/audio';
import { SaveSystem } from '../systems/save';
import { computeGDV } from '../systems/scoring';
import { useSettings, getSettings } from '@/stores/settingsStore';
import type { Action } from '@/types';

function sceneEvent(name: string) {
  window.dispatchEvent(new CustomEvent('mk-scene', { detail: name }));
}

/** Deep-space background used by all menu screens. */
function starfield(scene: Phaser.Scene) {
  // Base — deep indigo
  scene.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x06061a);

  const gfx = scene.add.graphics();

  // Subtle nebula patches (radial gradient simulation)
  const nebulae: [number, number, number, number][] = [
    [60,  50,  70, 0x1a0a3a],
    [260, 190, 60, 0x0a1a3a],
    [160, 120, 90, 0x12082a],
  ];
  for (const [nx, ny, nr, nc] of nebulae) {
    for (let r = nr; r > 0; r -= 8) {
      gfx.fillStyle(nc, 0.04 * (1 - r / nr));
      gfx.fillCircle(nx, ny, r);
    }
  }

  // Stars — three layers (distant / mid / bright)
  const STAR_DATA: [number, number, number, number, number][] = [];
  for (let i = 0; i < 55; i++) {
    const x = (i * 97  + 11) % GAME_W;
    const y = (i * 67  + 17) % GAME_H;
    const sz  = i < 35 ? 1 : 2;
    const col = i % 7 === 0 ? 0xffc83c
               : i % 7 === 1 ? 0x59d9e6
               : i % 7 === 2 ? 0xc084f5
               : 0xa8b4cc;
    const spd = 700 + i * 55;
    STAR_DATA.push([x, y, sz, col, spd]);
  }
  for (const [x, y, sz, col, spd] of STAR_DATA) {
    const star = scene.add.rectangle(x, y, sz, sz, col).setAlpha(0.6);
    scene.tweens.add({ targets: star, alpha: 0.08, duration: spd, yoyo: true, repeat: -1, delay: (x * 3) % 400 });
  }

  // Ornate double border — gold outer, purple inner
  gfx.lineStyle(2, 0xffc83c, 0.55);
  gfx.strokeRect(2, 2, GAME_W - 4, GAME_H - 4);
  gfx.lineStyle(1, 0x8c4bd9, 0.5);
  gfx.strokeRect(5, 5, GAME_W - 10, GAME_H - 10);

  // Corner accent diamonds
  const corners: [number, number][] = [[6, 6], [GAME_W - 6, 6], [6, GAME_H - 6], [GAME_W - 6, GAME_H - 6]];
  for (const [cx, cy] of corners) {
    gfx.fillStyle(0xffc83c, 0.7);
    gfx.fillRect(cx - 3, cy - 1, 6, 2);
    gfx.fillRect(cx - 1, cy - 3, 2, 6);
  }
}

/** Horizontal gold separator line with faded ends. */
function separator(scene: Phaser.Scene, y: number) {
  const g = scene.add.graphics();
  g.fillStyle(0xffc83c, 0.15); g.fillRect(20, y, GAME_W - 40, 1);
  g.fillStyle(0xffc83c, 0.55); g.fillRect(60, y, GAME_W - 120, 1);
  g.fillStyle(0xffc83c, 0.9);  g.fillRect(100, y, GAME_W - 200, 1);
}

/* ---------------- Splash ---------------- */
export class SplashScene extends Phaser.Scene {
  constructor() {
    super('Splash');
  }
  create() {
    sceneEvent('Splash');
    starfield(this);

    // Gold sparkle burst around the title area
    const sparks = this.add.particles(GAME_W / 2, 90, 'px-gold', {
      speed: { min: 15, max: 55 },
      scale: { start: 1.2, end: 0 },
      lifespan: { min: 500, max: 900 },
      quantity: 1,
      frequency: 180,
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-80, -12, 160, 24) } as any,
    }).setDepth(5);

    // Title — fade in then pulse
    const t = title(this, 86, 'MYSTIC KEY').setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 600, ease: 'Cubic.Out', onComplete: () => {
      this.tweens.add({ targets: t, scaleX: 1.03, scaleY: 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }});

    separator(this, 108);

    // Subtitle
    const sub = txt(this, GAME_W / 2, 120, 'A Zodiac Puzzle Adventure', 11, '#c084f5').setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, duration: 500, delay: 400 });

    // Zodiac symbols row
    const SYMBOLS = '♈♉♊♋♌♍♎♏♐♑♒♓';
    const symRow = txt(this, GAME_W / 2, 140, SYMBOLS, 9, '#3d3d6a').setAlpha(0);
    this.tweens.add({ targets: symRow, alpha: 0.6, duration: 600, delay: 700 });

    // Press hint — blink
    const hint = txt(this, GAME_W / 2, 210, 'PRESS ANY KEY  /  TAP TO START', 11, '#ffc83c').setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 1, duration: 400, delay: 900, onComplete: () => {
      this.tweens.add({ targets: hint, alpha: 0.15, duration: 550, yoyo: true, repeat: -1 });
    }});

    const go = () => {
      sparks.destroy();
      Audio.unlock();
      Audio.sfx('ui');
      this.scene.start('MainMenu');
    };
    this.input.keyboard?.once('keydown', go);
    this.input.once('pointerdown', go);
    this.time.delayedCall(10000, () => {
      this.registry.set('demoMode', true);
      this.registry.set('lives', START_LIVES);
      this.registry.set('runScore', 0);
      this.scene.start('Game', { roomId: 1 });
    });
  }
}

/* ---------------- Main Menu ---------------- */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }
  create() {
    sceneEvent('MainMenu');
    starfield(this);

    // Decorative title panel
    const g = this.add.graphics();
    g.fillStyle(0x0a0820, 0.85);
    g.fillRoundedRect(GAME_W / 2 - 110, 52, 220, 38, 6);
    g.lineStyle(1, 0xffc83c, 0.5);
    g.strokeRoundedRect(GAME_W / 2 - 110, 52, 220, 38, 6);

    title(this, 72, 'MYSTIC KEY');
    separator(this, 96);
    txt(this, GAME_W / 2, 106, 'Dana and the Twelve Seals', 11, '#9a7acc');

    Audio.music('menu');

    const menuItems: { label: string; action: () => void }[] = [
      { label: 'START GAME',  action: () => this.scene.start('SaveSelect') },
      { label: 'LEVEL SELECT', action: () => this.scene.start('WorldMap') },
      { label: 'LEADERBOARD', action: () => this.scene.start('Leaderboard', { back: 'MainMenu' }) },
      { label: 'SETTINGS',    action: () => this.scene.start('Settings', { back: 'MainMenu' }) },
      { label: 'CREDITS',     action: () => this.scene.start('Credits', { victory: false }) }
    ];
    try {
      const last = localStorage.getItem('mk-last-level');
      if (last) {
        menuItems.unshift({
          label: `RESUME  LVL ${last}`,
          action: () => this.scene.start('LevelIntro', { levelId: parseInt(last) })
        });
      }
    } catch { /* ignore */ }

    new Menu(this, GAME_W / 2, 138, 24, menuItems);

    separator(this, GAME_H - 22);
    txt(this, GAME_W / 2, GAME_H - 13, 'ARROWS / WASD  •  Z=JUMP  X=BLOCK  C=BREAK  V=FIRE', 8, '#3d3d6a');
  }
}

/* ---------------- Save Select ---------------- */
export class SaveSelectScene extends Phaser.Scene {
  constructor() {
    super('SaveSelect');
  }
  create() {
    sceneEvent('SaveSelect');
    starfield(this);
    title(this, 50, 'SAVE SELECT');
    const slots = SaveSystem.slots();
    const items = slots.map((s, i) => ({
      label: s.exists
        ? `SLOT ${i + 1}  ROOM ${s.room || 1}  [${s.constellationSeals.length}S]`
        : `SLOT ${i + 1}  - NEW GAME -`,
      action: () => {
        SaveSystem.select(i);
        this.registry.set('lives', START_LIVES);
        this.registry.set('continues', MAX_CONTINUES);
        this.registry.set('runScore', 0);
        this.registry.set('fire', false);
        SaveSystem.update(() => {});
        // Linear progression: resume from the slot's saved room (or 1)
        const room = (s.exists && s.room) || 1;
        this.scene.start('LevelIntro', { levelId: room });
      }
    }));
    items.push({ label: 'ERASE A SLOT', action: () => this.scene.start('EraseSelect') });
    items.push({ label: 'BACK', action: () => this.scene.start('MainMenu') });
    new Menu(this, GAME_W / 2, 110, 26, items, 11);
  }
}

export class EraseSelectScene extends Phaser.Scene {
  constructor() {
    super('EraseSelect');
  }
  create() {
    starfield(this);
    title(this, 50, 'ERASE SLOT');
    const slots = SaveSystem.slots();
    const items = slots.map((s, i) => ({
      label: `ERASE SLOT ${i + 1}${s.exists ? '' : ' (empty)'}`,
      action: () => {
        SaveSystem.erase(i);
        Audio.sfx('break');
        this.scene.restart();
      }
    }));
    items.push({ label: 'BACK', action: () => this.scene.start('SaveSelect') });
    new Menu(this, GAME_W / 2, 110, 26, items, 11);
  }
}

/* ---------------- Settings ---------------- */
export class SettingsScene extends Phaser.Scene {
  private back = 'MainMenu';
  private remapping: Action | null = null;
  private menu!: Menu;
  constructor() {
    super('Settings');
  }
  init(data: { back?: string }) {
    this.back = data?.back ?? 'MainMenu';
  }
  create() {
    sceneEvent('Settings');
    starfield(this);
    title(this, 36, 'SETTINGS');
    const s = () => useSettings.getState();
    const pct = (v: number) => `${Math.round(v * 100)}%`;

    const labels = () => [
      `SOUND  < ${pct(s().soundVol)} >`,
      `MUSIC  < ${pct(s().musicVol)} >`,
      `PIXEL SCALE: ${s().pixelScale.toUpperCase()}`,
      `HIGH CONTRAST: ${s().highContrast ? 'ON' : 'OFF'}`,
      `MOBILE UI: ${pct(s().mobileUiScale)}`,
      'REMAP CONTROLS',
      'BACK'
    ];

    const refresh = () => labels().forEach((l, i) => this.menu.setLabel(i, l));

    this.menu = new Menu(
      this,
      GAME_W / 2,
      78,
      22,
      [
        {
          label: '',
          action: () => {
            s().set({ soundVol: Math.round(((s().soundVol + 0.1) % 1.1) * 10) / 10 });
            Audio.sfx('coin');
            refresh();
          }
        },
        {
          label: '',
          action: () => {
            s().set({ musicVol: Math.round(((s().musicVol + 0.1) % 1.1) * 10) / 10 });
            refresh();
          }
        },
        {
          label: '',
          action: () => {
            s().set({ pixelScale: s().pixelScale === 'fit' ? 'integer' : 'fit' });
            window.dispatchEvent(new Event('mk-rescale'));
            refresh();
          }
        },
        {
          label: '',
          action: () => {
            s().set({ highContrast: !s().highContrast });
            refresh();
          }
        },
        {
          label: '',
          action: () => {
            const v = s().mobileUiScale;
            s().set({ mobileUiScale: v >= 1.5 ? 0.75 : Math.round((v + 0.25) * 100) / 100 });
            refresh();
          }
        },
        { label: '', action: () => this.scene.start('Remap', { back: this.back }) },
        { label: '', action: () => this.scene.start(this.back) }
      ],
      10
    );
    refresh();
  }
}

export class RemapScene extends Phaser.Scene {
  private back = 'MainMenu';
  private waiting: Action | null = null;
  private info!: Phaser.GameObjects.Text;
  constructor() {
    super('Remap');
  }
  init(data: { back?: string }) {
    this.back = data?.back ?? 'MainMenu';
  }
  create() {
    starfield(this);
    title(this, 36, 'REMAP CONTROLS');
    const actions: Action[] = ['left', 'right', 'up', 'jump', 'create', 'destroy', 'fire', 'pause'];
    const km = () => getSettings().keymap;
    const labels = () =>
      actions.map((a) => `${a.toUpperCase().padEnd(8)} ${km()[a][0]}`).concat(['BACK']);
    const menu = new Menu(
      this,
      GAME_W / 2,
      75,
      21,
      actions
        .map((a) => ({
          label: '',
          action: () => {
            this.waiting = a;
            this.info.setText(`Press a key for ${a.toUpperCase()}...`);
          }
        }))
        .concat([{ label: '', action: () => this.scene.start('Settings', { back: this.back }) }]),
      10
    );
    labels().forEach((l, i) => menu.setLabel(i, l));
    this.info = txt(this, GAME_W / 2, GAME_H - 16, 'Select an action, then press a key', 8, '#9a9ab0');
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (!this.waiting) return;
      ev.stopPropagation();
      useSettings.getState().remap(this.waiting, ev.code);
      this.waiting = null;
      labels().forEach((l, i) => menu.setLabel(i, l));
      this.info.setText('Saved! Select another or BACK');
      Audio.sfx('key');
    });
  }
}

/* ---------------- Credits ---------------- */
export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('Credits');
  }
  create(data: { victory?: boolean }) {
    sceneEvent('Credits');
    starfield(this);
    const slot = SaveSystem.current();
    let y = 40;
    if (data?.victory) {
      Audio.music('victory');
      title(this, y, 'THE LIGHT RETURNS');
      y += 28;
      if (slot.princessUnlocked) {
        txt(this, GAME_W / 2, y, 'Dana frees the Princess from the', 9, '#ffe89a');
        txt(this, GAME_W / 2, y + 12, 'Princess Chamber. All 12 seals shine!', 9, '#ffe89a');
        y += 30;
      } else {
        txt(this, GAME_W / 2, y, 'The King of Darkness is defeated...', 9, '#9a9ab0');
        txt(this, GAME_W / 2, y + 12, 'but a sealed chamber remains. (12 seals?)', 9, '#9a9ab0');
        y += 30;
      }
      const gdv = computeGDV(slot, 0);
      txt(this, GAME_W / 2, y + 6, '- GDV SCORE -', 11, '#ffc83c');
      txt(
        this,
        GAME_W / 2,
        y + 22,
        `Levels ${gdv.levels}  Secrets ${gdv.secrets}`,
        9
      );
      txt(this, GAME_W / 2, y + 34, `Items ${gdv.items}  Score ${gdv.score}`, 9);
      title(this, y + 60, `GDV ${gdv.gdv}  GRADE ${gdv.grade}`);
      SaveSystem.update((s) => {
        if (gdv.gdv > s.bestGDV) {
          s.bestGDV = gdv.gdv;
          s.bestGrade = gdv.grade;
        }
      });
      y += 80;
    } else {
      title(this, y, 'CREDITS');
      y += 30;
    }
    const lines = [
      'MYSTIC KEY',
      '',
      'Design & Code: Dana Softworks',
      'Pixel Art: Procedural Pixies',
      'Chiptunes: Web Audio Wizards',
      '',
      'Inspired by the golden age',
      'of magical arcade puzzlers',
      '',
      'Thank you for playing!'
    ];
    lines.forEach((l, i) => txt(this, GAME_W / 2, y + 14 + i * 12, l, 8, '#9a9ab0'));
    txt(this, GAME_W / 2, GAME_H - 14, 'TAP / ENTER TO RETURN', 8, '#ffc83c');
    const back = () => {
      Audio.stopMusic();
      this.scene.start('MainMenu');
    };
    this.input.keyboard?.once('keydown-ENTER', back);
    this.input.keyboard?.once('keydown-ESC', back);
    this.input.once('pointerdown', back);
  }
}
