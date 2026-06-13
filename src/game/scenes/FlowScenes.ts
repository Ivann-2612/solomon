import * as Phaser from 'phaser';
import { GAME_W, GAME_H, START_LIVES, constellationOfRoom } from '../constants';
import { txt, title, Menu } from '../ui/ui';
import { Audio } from '../audio/audio';
import { SaveSystem } from '../systems/save';
import { roomTitle, type Ending } from '../levels/registry';
import { WORLD_TINTS } from '../assets/palette';

// Local helpers bridging old level-data API to current room registry
const levelName = roomTitle;

const BOSS_ROOM_NAMES: Record<number, string> = {
  12: 'Flame Guardian',
  24: 'Stone Colossus',
  36: 'Shadow Serpent',
  48: 'Celestial Demon',
  49: 'King of Darkness',
};
const BOSS_ROOM_IDS = new Set(Object.keys(BOSS_ROOM_NAMES).map(Number));

function getLevel(id: number) {
  return {
    name: roomTitle(id),
    world: id <= 48 ? constellationOfRoom(id) : 12,
    boss: BOSS_ROOM_NAMES[id] ?? null,
    time: 99,
  };
}

function sceneEvent(name: string) {
  window.dispatchEvent(new CustomEvent('mk-scene', { detail: name }));
}

/* ---------------- Level Select (linear progression) ----------------
 * Lists only the rooms the player has already cleared, plus the current
 * resume room. Scene key kept as 'WorldMap' for existing references. */
export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMap');
  }
  create() {
    sceneEvent('WorldMap');
    Audio.music('menu');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
    title(this, 24, 'LEVEL SELECT');
    const slot = SaveSystem.current();
    const cur = slot.room || 1;
    const ids = Array.from(new Set([...slot.completedStages, cur])).sort((a, b) => a - b);

    // grid of cleared rooms (8 per row)
    const perRow = 8;
    ids.forEach((id, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const x = 40 + col * 40;
      const y = 60 + row * 22;
      const done = slot.completedStages.includes(id);
      const isBoss = BOSS_ROOM_IDS.has(id);
      const tint = isBoss
        ? (id === cur ? 0xffc83c : 0xe23b3b)
        : WORLD_TINTS[Math.min(id <= 48 ? constellationOfRoom(id) : 11, WORLD_TINTS.length - 1)];
      this.add.rectangle(x, y, 34, 18, isBoss ? 0x3a0a0a : 0x2a2a55).setStrokeStyle(isBoss ? 2 : 1, tint);
      const label = isBoss ? `${id}☠` : String(id);
      const t = this.add
        .text(x, y, label, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: done ? '#2ecc71' : isBoss ? '#e23b3b' : '#ffc83c'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        Audio.sfx('ui');
        this.scene.start('LevelIntro', { levelId: id });
      });
    });

    txt(this, GAME_W / 2, GAME_H - 52, `CURRENT  ROOM ${cur} - ${roomTitle(cur).toUpperCase()}`, 9, '#ffc83c');
    txt(
      this,
      GAME_W / 2,
      GAME_H - 34,
      `SEALS ${slot.constellationSeals.length}/12  FAIRIES ${slot.fairies}`,
      8,
      '#9a9ab0'
    );
    txt(this, GAME_W / 2, GAME_H - 16, '[ENTER] CONTINUE   [ESC] MENU', 8, '#3d3d7a');

    const kb = this.input.keyboard;
    kb?.on('keydown-ENTER', () => this.scene.start('LevelIntro', { levelId: cur }));
    kb?.on('keydown-SPACE', () => this.scene.start('LevelIntro', { levelId: cur }));
    kb?.on('keydown-ESC', () => this.scene.start('MainMenu'));
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
    // save last played level for resume-on-refresh
    try { localStorage.setItem('mk-last-level', String(data.levelId)); } catch { /* ignore */ }
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
    const tint = WORLD_TINTS[Math.min(lvl.world, WORLD_TINTS.length - 1)];
    this.add.rectangle(GAME_W / 2, GAME_H / 2 - 20, 220, 3, tint);
    title(this, GAME_H / 2 - 50, lvl.name.toUpperCase());
    if (lvl.boss) txt(this, GAME_W / 2, GAME_H / 2, lvl.boss + ' awaits...', 11, '#e23b3b');
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

    // Full-screen dim
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.72);

    // Central glassmorphism card
    const CX = GAME_W / 2, CY = GAME_H / 2 + 4;
    const g = this.add.graphics();
    g.fillStyle(0x07071e, 0.94);
    g.fillRoundedRect(CX - 110, CY - 72, 220, 148, 12);
    g.lineStyle(1.5, 0xffc83c, 0.55);
    g.strokeRoundedRect(CX - 110, CY - 72, 220, 148, 12);
    g.lineStyle(1, 0x8c4bd9, 0.3);
    g.strokeRoundedRect(CX - 108, CY - 70, 216, 144, 10);
    // Top accent strip
    g.fillStyle(0xffc83c, 0.12);
    g.fillRoundedRect(CX - 110, CY - 72, 220, 20, { tl: 12, tr: 12, bl: 0, br: 0 });

    title(this, CY - 56, 'PAUSED');

    // Thin separator
    g.fillStyle(0xffc83c, 0.3);
    g.fillRect(CX - 80, CY - 36, 160, 1);

    const resume = () => { this.scene.resume('Game'); this.scene.stop(); };
    new Menu(this, CX, CY + 16, 26, [
      { label: 'RESUME',        action: resume },
      { label: 'RESTART LEVEL', action: () => { this.scene.stop('Game'); this.scene.start('Game', { levelId: data.levelId }); } },
      { label: 'QUIT TO MAP',   action: () => { Audio.stopMusic(); this.scene.stop('Game'); this.scene.start('WorldMap'); } },
    ]);

    this.input.keyboard?.on('keydown-ESC', resume);
  }
}

/* ---------------- Level Complete ---------------- */
export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelComplete');
  }
  create(data: {
    levelId: number;
    nextId?: number;
    stats: { score: number; items: number; secrets: number; enemies: number; timeLeft: number; timeBonus: number };
  }) {
    sceneEvent('LevelComplete');
    Audio.music('victory');

    // Deep bg + subtle star hints
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x040412);
    const g = this.add.graphics();
    for (let i = 0; i < 20; i++) {
      g.fillStyle(0xffffff, 0.07 + (i % 3) * 0.04);
      g.fillRect((i * 97 + 11) % GAME_W, (i * 67 + 17) % GAME_H, 1, 1);
    }

    // Card
    const CX = GAME_W / 2;
    g.fillStyle(0x08082a, 0.97);
    g.fillRoundedRect(CX - 130, 28, 260, 184, 10);
    g.lineStyle(1.5, 0xffc83c, 0.6);
    g.strokeRoundedRect(CX - 130, 28, 260, 184, 10);
    // Gold top strip
    g.fillStyle(0xffc83c, 0.1);
    g.fillRoundedRect(CX - 130, 28, 260, 22, { tl: 10, tr: 10, bl: 0, br: 0 });

    title(this, 44, 'STAGE CLEAR!');

    const s = data.stats;
    const isBoss = BOSS_ROOM_IDS.has(data.levelId);
    txt(this, CX, 78, levelName(data.levelId).toUpperCase(), 12, '#ffc83c');
    if (isBoss) {
      txt(this, CX, 94, `☠ ${BOSS_ROOM_NAMES[data.levelId]?.toUpperCase()} DEFEATED ☠`, 8, '#e23b3b');
    }

    // Stats rows
    const sy = isBoss ? 110 : 104;
    g.fillStyle(0xffc83c, 0.18); g.fillRect(CX - 100, sy - 4, 200, 1);
    const ROW_H = 14;
    const rows: [string, string | number, string][] = [
      ['SCORE',      s.score,    '#f4f4f4'],
      ['TIME BONUS', s.timeBonus, '#59d9e6'],
      ['ITEMS',      s.items,    '#c084f5'],
      ['ENEMIES',    s.enemies,  '#e23b3b'],
      ['SECRETS',    s.secrets,  '#ffc83c'],
    ];
    rows.forEach(([label, val, col], i) => {
      txt(this, CX - 30, sy + 8 + i * ROW_H, label, 9, '#9a9ab0');
      txt(this, CX + 50, sy + 8 + i * ROW_H, String(val), 9, col);
    });
    g.fillStyle(0xffc83c, 0.18); g.fillRect(CX - 100, sy + 8 + rows.length * ROW_H, 200, 1);

    SaveSystem.addScore(data.levelId, levelName(data.levelId), s.score + s.timeBonus);

    const goNext = () => { Audio.stopMusic(); this.scene.start('LevelIntro', { levelId: data.nextId ?? 1 }); };
    const goMap  = () => { Audio.stopMusic(); this.scene.start('WorldMap'); };

    const menuItems = [];
    if (data.nextId != null) {
      menuItems.push({ label: 'NEXT STAGE', action: goNext });
    }
    menuItems.push({ label: 'WORLD MAP', action: goMap });
    new Menu(this, CX, 194, 24, menuItems, 12);

    // Tap anywhere on the screen → advance to next stage (belt-and-suspenders for touch)
    this.input.once('pointerdown', data.nextId != null ? goNext : goMap);
    // Auto-advance after 6 s so the game never stays frozen
    this.time.delayedCall(6000, data.nextId != null ? goNext : goMap);

    const hint = txt(this, CX, 222, 'TAP TO CONTINUE', 8, '#ffc83c');
    this.tweens.add({ targets: hint, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });
  }
}

/* ---------------- Secret Found (overlay banner) ---------------- */
export class SecretFoundScene extends Phaser.Scene {
  constructor() {
    super('SecretFound');
  }
  create(data: { text: string }) {
    const bg = this.add.rectangle(GAME_W / 2, 70, 260, 44, 0x5d2e99, 0.92).setStrokeStyle(2, 0xffc83c);
    const t1 = txt(this, GAME_W / 2, 60, '* SECRET FOUND *', 12, '#ffc83c');
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

    // Deep crimson bg
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0e0208);
    const g = this.add.graphics();
    // Vignette: dark edges
    g.fillStyle(0x000000, 0.45);
    g.fillRect(0, 0, GAME_W, 28);
    g.fillRect(0, GAME_H - 28, GAME_W, 28);

    // Card
    const CX = GAME_W / 2, CY = GAME_H / 2 + 4;
    g.fillStyle(0x100408, 0.96);
    g.fillRoundedRect(CX - 110, CY - 66, 220, 132, 10);
    g.lineStyle(1.5, 0xe23b3b, 0.65);
    g.strokeRoundedRect(CX - 110, CY - 66, 220, 132, 10);
    g.fillStyle(0xe23b3b, 0.08);
    g.fillRoundedRect(CX - 110, CY - 66, 220, 20, { tl: 10, tr: 10, bl: 0, br: 0 });

    title(this, CY - 50, 'GAME OVER');

    g.fillStyle(0xe23b3b, 0.25); g.fillRect(CX - 80, CY - 28, 160, 1);

    const continues = this.registry.get('continues') as number;
    txt(this, CX, CY - 12, continues > 0 ? `${continues} CONTINUE${continues > 1 ? 'S' : ''} REMAINING` : 'NO CONTINUES LEFT', 10, continues > 0 ? '#ffc83c' : '#555');

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
    new Menu(this, CX, CY + 24, 26, items);
  }
}

/* ---------------- Leaderboard ---------------- */
export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('Leaderboard');
  }
  create(data: { back?: string }) {
    const backScene = data?.back ?? 'MainMenu';
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0a23);
    title(this, 28, 'LEADERBOARD');
    txt(this, GAME_W / 2, 52, 'TOP SCORES', 9, '#9a9ab0');

    const scores = SaveSystem.getTopScores(10);
    if (scores.length === 0) {
      txt(this, GAME_W / 2, GAME_H / 2, 'No scores yet. Complete levels!', 9, '#3d3d7a');
    } else {
      scores.forEach((entry, i) => {
        const col = i === 0 ? '#ffc83c' : i < 3 ? '#f4f4f4' : '#9a9ab0';
        const rank = `${i + 1}.`.padEnd(4);
        const lvl = entry.levelName.padEnd(18);
        const sc = String(entry.score).padStart(6, '0');
        txt(this, GAME_W / 2, 72 + i * 20, `${rank}${lvl} ${sc}`, 9, col);
      });
    }

    txt(this, GAME_W / 2, GAME_H - 22, 'PRESS ENTER / ESC TO GO BACK', 8, '#3d3d7a');
    const back = () => this.scene.start(backScene);
    this.input.keyboard?.once('keydown-ENTER', back);
    this.input.keyboard?.once('keydown-ESC', back);
    this.input.once('pointerdown', back);
  }
}

/* ---------------- Ending ---------------- */
export class EndingScene extends Phaser.Scene {
  constructor() {
    super('Ending');
  }
  create(data: { ending: Ending }) {
    sceneEvent('Ending');
    Audio.music('victory');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x04040e);

    const gfx = this.add.graphics();
    for (let i = 0; i < 20; i++) {
      const x = (i * 113 + 7) % GAME_W;
      const y = (i * 79 + 13) % GAME_H;
      const col = i % 3 === 0 ? 0xffc83c : i % 3 === 1 ? 0x59d9e6 : 0x8c4bd9;
      gfx.fillStyle(col, 0.5);
      gfx.fillRect(x, y, 2, 2);
      this.tweens.add({ targets: gfx, alpha: { from: 1, to: 0.3 }, duration: 600 + i * 50, yoyo: true, repeat: -1 });
    }

    switch (data.ending) {
      case 'best':
        title(this, 36, 'THE LIGHT RETURNS');
        txt(this, GAME_W / 2, 72, 'Dana frees the Princess.', 10, '#ffe89a');
        txt(this, GAME_W / 2, 88, 'All 12 Seals of the Zodiac shine!', 9, '#ffc83c');
        txt(this, GAME_W / 2, 110, 'The Pages of Time and Space', 9, '#59d9e6');
        txt(this, GAME_W / 2, 124, 'reveal the true Solomon Chamber.', 9, '#59d9e6');
        txt(this, GAME_W / 2, 150, '*** PERFECT ENDING ***', 12, '#ffc83c');
        break;
      case 'princess':
        title(this, 36, 'THE PRINCESS FREED');
        txt(this, GAME_W / 2, 72, 'Dana rescues the Princess,', 10, '#ffe89a');
        txt(this, GAME_W / 2, 86, 'but the Pages remain hidden...', 9, '#9a9ab0');
        txt(this, GAME_W / 2, 110, 'Seek the constellation seals', 9, '#59d9e6');
        txt(this, GAME_W / 2, 124, 'to uncover the full truth.', 9, '#59d9e6');
        break;
      case 'pages':
        title(this, 36, 'WISDOM GATHERED');
        txt(this, GAME_W / 2, 72, 'The Pages of Time and Space', 10, '#59d9e6');
        txt(this, GAME_W / 2, 86, 'are in Dana\'s hands...', 9, '#59d9e6');
        txt(this, GAME_W / 2, 110, 'But the Princess Chamber', 9, '#9a9ab0');
        txt(this, GAME_W / 2, 124, 'still waits for all 12 seals.', 9, '#9a9ab0');
        break;
      default: // 'normal'
        title(this, 36, 'DARKNESS DEFEATED');
        txt(this, GAME_W / 2, 72, 'The King of Darkness falls,', 10, '#f4f4f4');
        txt(this, GAME_W / 2, 86, 'but sealed secrets remain...', 9, '#9a9ab0');
        txt(this, GAME_W / 2, 110, 'Find all 12 Zodiac Seals', 9, '#ffc83c');
        txt(this, GAME_W / 2, 124, 'to unlock the true ending.', 9, '#ffc83c');
        break;
    }

    txt(this, GAME_W / 2, GAME_H - 22, 'PRESS ENTER / TAP TO CONTINUE', 8, '#3d3d7a');
    const cont = () => {
      Audio.stopMusic();
      this.scene.start('Credits', { victory: true });
    };
    this.time.delayedCall(500, () => {
      this.input.keyboard?.once('keydown-ENTER', cont);
      this.input.keyboard?.once('keydown-SPACE', cont);
      this.input.once('pointerdown', cont);
    });
    this.time.delayedCall(15000, cont);
  }
}

