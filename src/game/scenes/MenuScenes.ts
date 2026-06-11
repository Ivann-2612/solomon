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

function starfield(scene: Phaser.Scene) {
  scene.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
  for (let i = 0; i < 40; i++) {
    const x = (i * 97) % GAME_W;
    const y = (i * 53) % GAME_H;
    scene.add.rectangle(x, y, 2, 2, i % 5 === 0 ? 0xffc83c : 0x3d3d7a).setAlpha(0.6);
  }
}

/* ---------------- Splash ---------------- */
export class SplashScene extends Phaser.Scene {
  constructor() {
    super('Splash');
  }
  create() {
    sceneEvent('Splash');
    starfield(this);
    title(this, 90, 'MYSTIC KEY');
    txt(this, GAME_W / 2, 120, 'A Zodiac Puzzle Adventure', 10, '#8c4bd9');
    const hint = txt(this, GAME_W / 2, 220, 'PRESS ANY KEY / TAP', 10, '#ffc83c');
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
    const go = () => {
      Audio.unlock();
      Audio.sfx('ui');
      this.scene.start('MainMenu');
    };
    this.input.keyboard?.once('keydown', go);
    this.input.once('pointerdown', go);
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
    title(this, 70, 'MYSTIC KEY');
    txt(this, GAME_W / 2, 95, 'Dana and the Twelve Seals', 9, '#9a9ab0');
    Audio.music('menu');
    const menuItems: { label: string; action: () => void }[] = [
      { label: 'START GAME', action: () => this.scene.start('SaveSelect') },
      { label: 'LEADERBOARD', action: () => this.scene.start('Leaderboard', { back: 'MainMenu' }) },
      { label: 'SETTINGS', action: () => this.scene.start('Settings', { back: 'MainMenu' }) },
      { label: 'CREDITS', action: () => this.scene.start('Credits', { victory: false }) }
    ];
    // show RESUME if there's a saved level
    try {
      const last = localStorage.getItem('mk-last-level');
      if (last) {
        menuItems.unshift({
          label: `RESUME  LVL ${last}`,
          action: () => this.scene.start('LevelIntro', { levelId: parseInt(last) })
        });
      }
    } catch { /* ignore */ }
    new Menu(this, GAME_W / 2, 130, 22, menuItems);
    txt(this, GAME_W / 2, GAME_H - 14, 'v1.0  ARROWS+Z/X/C/V  ENTER=OK', 8, '#3d3d7a');
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
        ? `SLOT ${i + 1}  ${s.completedStages.length}/64  [${s.seals.length}S]`
        : `SLOT ${i + 1}  - NEW GAME -`,
      action: () => {
        SaveSystem.select(i);
        this.registry.set('lives', START_LIVES);
        this.registry.set('continues', MAX_CONTINUES);
        this.registry.set('runScore', 0);
        this.registry.set('fire', false);
        SaveSystem.update(() => {});
        this.scene.start('WorldMap');
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
    const actions: Action[] = ['left', 'right', 'jump', 'create', 'destroy', 'fire', 'pause'];
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
