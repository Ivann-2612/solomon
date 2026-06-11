import Phaser from 'phaser';
import { GAME_W, GAME_H, ZODIAC, START_LIVES } from '../constants';
import { txt, title, Menu } from '../ui/ui';
import { Audio } from '../audio/audio';
import { SaveSystem } from '../systems/save';
import { getLevel } from '../levels/generator';
import { worldOfLevel, levelName, secretLevelOfWorld, BOSS_NAMES } from '../levels/worlds';
import { WORLD_TINTS } from '../assets/palette';

function sceneEvent(name: string) {
  window.dispatchEvent(new CustomEvent('mk-scene', { detail: name }));
}

/* ---------------- World Map ---------------- */
export class WorldMapScene extends Phaser.Scene {
  private sel = 0;
  private boxes: Phaser.GameObjects.Rectangle[] = [];
  constructor() {
    super('WorldMap');
  }
  create() {
    sceneEvent('WorldMap');
    Audio.music('menu');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
    title(this, 24, 'WORLD MAP');
    const slot = SaveSystem.current();
    this.boxes = [];
    const maxWorldUnlocked = Math.min(11, Math.floor((slot.unlockedStage - 1) / 4));

    for (let w = 0; w < 12; w++) {
      const col = w % 4;
      const row = Math.floor(w / 4);
      const x = 52 + col * 86;
      const y = 64 + row * 56;
      const unlocked = w <= maxWorldUnlocked;
      const box = this.add
        .rectangle(x, y, 78, 46, unlocked ? 0x2a2a55 : 0x16162e)
        .setStrokeStyle(2, unlocked ? WORLD_TINTS[w] : 0x3d3d7a);
      this.boxes.push(box);
      this.add
        .text(x, y - 12, ZODIAC[w].toUpperCase(), {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: unlocked ? '#ffc83c' : '#3d3d7a'
        })
        .setOrigin(0.5);
      // stage dots
      for (let st = 1; st <= 4; st++) {
        const id = w * 4 + st;
        const done = slot.completedStages.includes(id);
        const open = id <= slot.unlockedStage;
        this.add.rectangle(
          x - 21 + (st - 1) * 14,
          y + 6,
          8,
          8,
          done ? 0x2ecc71 : open ? 0xffc83c : 0x3d3d7a
        );
      }
      const sealHave = slot.seals.includes(w);
      if (sealHave) this.add.text(x + 24, y + 1, '♦', { fontSize: '10px', color: '#d957d9' }).setOrigin(0.5);
      if (unlocked) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerdown', () => {
          this.sel = w;
          this.openWorld(w);
        });
        box.on('pointerover', () => {
          this.sel = w;
          this.highlight();
        });
      }
    }

    // bottom row: bonus secrets + Solomon Chamber
    let bx = 40;
    for (const lid of [61, 62, 63]) {
      if (slot.secretsUnlocked.includes(lid)) {
        const t = this.add
          .text(bx, GAME_H - 36, `★S${lid - 48}`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: slot.completedStages.includes(lid) ? '#2ecc71' : '#d957d9'
          })
          .setInteractive({ useHandCursor: true });
        t.on('pointerdown', () => this.startLevel(lid));
      }
      bx += 40;
    }
    if (slot.unlockedStage >= 49) {
      const t = this.add
        .text(GAME_W - 130, GAME_H - 36, '▲ SOLOMON CHAMBER', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ffc83c'
        })
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => this.startLevel(64));
    }
    const pages = [
      slot.pages.time ? 'PAGE OF TIME' : null,
      slot.pages.space ? 'PAGE OF SPACE' : null
    ].filter(Boolean);
    txt(
      this,
      GAME_W / 2,
      GAME_H - 16,
      `SEALS ${slot.seals.length}/12${pages.length ? '  ' + pages.join(' + ') : ''}  [ESC] MENU`,
      8,
      '#9a9ab0'
    );

    const kb = this.input.keyboard;
    kb?.on('keydown-LEFT', () => this.move(-1));
    kb?.on('keydown-RIGHT', () => this.move(1));
    kb?.on('keydown-UP', () => this.move(-4));
    kb?.on('keydown-DOWN', () => this.move(4));
    kb?.on('keydown-ENTER', () => this.sel <= maxWorldUnlocked && this.openWorld(this.sel));
    kb?.on('keydown-SPACE', () => this.sel <= maxWorldUnlocked && this.openWorld(this.sel));
    kb?.on('keydown-ESC', () => this.scene.start('MainMenu'));
    this.highlight();
  }
  private move(d: number) {
    this.sel = Phaser.Math.Clamp(this.sel + d, 0, 11);
    this.highlight();
    Audio.sfx('ui');
  }
  private highlight() {
    this.boxes.forEach((b, i) => b.setFillStyle(i === this.sel ? 0x3d3d7a : 0x2a2a55));
  }
  private openWorld(w: number) {
    this.scene.start('StageSelect', { world: w });
  }
  private startLevel(id: number) {
    this.scene.start('LevelIntro', { levelId: id });
  }
}

/* ---------------- Stage Select ---------------- */
export class StageSelectScene extends Phaser.Scene {
  constructor() {
    super('StageSelect');
  }
  create(data: { world: number }) {
    const w = data.world;
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
    title(this, 40, ZODIAC[w].toUpperCase());
    const slot = SaveSystem.current();
    const items = [];
    for (let st = 1; st <= 4; st++) {
      const id = w * 4 + st;
      const open = id <= slot.unlockedStage;
      const done = slot.completedStages.includes(id);
      const boss = getLevel(id).boss;
      items.push({
        label: `STAGE ${st}${boss ? ' ☠' : ''} ${done ? '✓' : open ? '' : '🔒'}`,
        action: () => {
          if (open) this.scene.start('LevelIntro', { levelId: id });
        }
      });
    }
    const secretId = secretLevelOfWorld(w);
    if (slot.secretsUnlocked.includes(secretId)) {
      items.push({
        label: `★ SECRET ${slot.completedStages.includes(secretId) ? '✓' : ''}`,
        action: () => this.scene.start('LevelIntro', { levelId: secretId })
      });
    }
    items.push({ label: 'BACK', action: () => this.scene.start('WorldMap') });
    new Menu(this, GAME_W / 2, 95, 24, items, 11);
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('WorldMap'));
  }
}

/* ---------------- Level Intro ---------------- */
export class LevelIntroScene extends Phaser.Scene {
  constructor() {
    super('LevelIntro');
  }
  create(data: { levelId: number }) {
    sceneEvent('LevelIntro');
    const lvl = getLevel(data.levelId);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
    const tint = WORLD_TINTS[Math.min(lvl.world, WORLD_TINTS.length - 1)];
    this.add.rectangle(GAME_W / 2, GAME_H / 2 - 20, 220, 3, tint);
    title(this, GAME_H / 2 - 50, lvl.name.toUpperCase());
    if (lvl.boss) txt(this, GAME_W / 2, GAME_H / 2, BOSS_NAMES[lvl.boss] + ' awaits...', 11, '#e23b3b');
    else txt(this, GAME_W / 2, GAME_H / 2, 'Find the key. Reach the door.', 10, '#9a9ab0');
    txt(
      this,
      GAME_W / 2,
      GAME_H / 2 + 22,
      `TIME ${lvl.time}   LIVES ${this.registry.get('lives')}`,
      10,
      '#ffc83c'
    );
    const hint = txt(this, GAME_W / 2, GAME_H - 40, 'TAP / PRESS TO START', 9, '#f4f4f4');
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
    const go = () => this.scene.start('Game', { levelId: data.levelId });
    this.time.delayedCall(300, () => {
      this.input.keyboard?.once('keydown', go);
      this.input.once('pointerdown', go);
    });
    this.time.delayedCall(2600, go);
  }
}

/* ---------------- Pause ---------------- */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }
  create(data: { levelId: number }) {
    sceneEvent('Pause');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.6);
    title(this, 90, 'PAUSED');
    new Menu(this, GAME_W / 2, 140, 24, [
      {
        label: 'RESUME',
        action: () => {
          this.scene.resume('Game');
          this.scene.stop();
        }
      },
      {
        label: 'RESTART LEVEL',
        action: () => {
          this.scene.stop('Game');
          this.scene.start('Game', { levelId: data.levelId });
        }
      },
      {
        label: 'QUIT TO MAP',
        action: () => {
          Audio.stopMusic();
          this.scene.stop('Game');
          this.scene.start('WorldMap');
        }
      }
    ]);
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.resume('Game');
      this.scene.stop();
    });
  }
}

/* ---------------- Level Complete ---------------- */
export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }
  create(data: {
    levelId: number;
    stats: { score: number; items: number; secrets: number; enemies: number; timeLeft: number; timeBonus: number };
  }) {
    sceneEvent('LevelComplete');
    Audio.music('victory');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
    title(this, 50, 'STAGE CLEAR!');
    const s = data.stats;
    txt(this, GAME_W / 2, 90, levelName(data.levelId).toUpperCase(), 11, '#ffc83c');
    txt(this, GAME_W / 2, 115, `SCORE      ${s.score}`, 10);
    txt(this, GAME_W / 2, 130, `TIME BONUS ${s.timeBonus}`, 10);
    txt(this, GAME_W / 2, 145, `ITEMS ${s.items}  ENEMIES ${s.enemies}  SECRETS ${s.secrets}`, 9, '#9a9ab0');

    const slot = SaveSystem.current();
    const next =
      data.levelId < 48
        ? data.levelId + 1
        : data.levelId === 48
          ? 64
          : null;
    const items = [];
    if (next && (next <= slot.unlockedStage || (next === 64 && slot.unlockedStage >= 49))) {
      items.push({
        label: 'NEXT STAGE',
        action: () => {
          Audio.stopMusic();
          this.scene.start('LevelIntro', { levelId: next });
        }
      });
    }
    items.push({
      label: 'WORLD MAP',
      action: () => {
        Audio.stopMusic();
        this.scene.start('WorldMap');
      }
    });
    new Menu(this, GAME_W / 2, 190, 24, items, 11);
  }
}

/* ---------------- Secret Found (overlay banner) ---------------- */
export class SecretFoundScene extends Phaser.Scene {
  constructor() {
    super('SecretFound');
  }
  create(data: { text: string }) {
    const bg = this.add.rectangle(GAME_W / 2, 70, 260, 44, 0x5d2e99, 0.92).setStrokeStyle(2, 0xffc83c);
    const t1 = txt(this, GAME_W / 2, 60, '★ SECRET FOUND ★', 12, '#ffc83c');
    const t2 = txt(this, GAME_W / 2, 78, data.text ?? '', 9, '#f4f4f4');
    this.tweens.add({ targets: [bg, t1, t2], alpha: { from: 0, to: 1 }, duration: 200 });
    this.time.delayedCall(1700, () => {
      this.tweens.add({
        targets: [bg, t1, t2],
        alpha: 0,
        duration: 300,
        onComplete: () => this.scene.stop()
      });
    });
  }
}

/* ---------------- Game Over ---------------- */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }
  create(data: { levelId: number }) {
    sceneEvent('GameOver');
    Audio.music('gameover');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x16060a);
    title(this, 80, 'GAME OVER');
    const continues = this.registry.get('continues') as number;
    txt(this, GAME_W / 2, 115, `CONTINUES LEFT: ${continues}`, 10, '#9a9ab0');
    const items = [];
    if (continues > 0) {
      items.push({
        label: 'CONTINUE',
        action: () => {
          this.registry.set('continues', continues - 1);
          this.registry.set('lives', START_LIVES);
          Audio.stopMusic();
          this.scene.start('LevelIntro', { levelId: data.levelId });
        }
      });
    }
    items.push({
      label: 'QUIT TO MENU',
      action: () => {
        this.registry.set('lives', START_LIVES);
        Audio.stopMusic();
        this.scene.start('MainMenu');
      }
    });
    new Menu(this, GAME_W / 2, 150, 24, items);
  }
}
