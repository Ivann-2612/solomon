import Phaser from 'phaser';
import { Tile } from '@/types';
import type { LevelData, ItemType } from '@/types';
import {
  TILE,
  HUD_H,
  GAME_W,
  GAME_H,
  GRID_W,
  GRID_H,
  POINTS,
  FIREBALL_SPEED,
  FIREBALL_RANGE_TILES,
  FIREBALL_RANGE_UPGRADED,
  FINAL_STAGE_ID
} from '../constants';
import { getLevel } from '../levels/generator';
import { worldOfLevel, BOSS_NAMES, secretLevelOfWorld } from '../levels/worlds';
import { WORLD_TINTS } from '../assets/palette';
import { Player } from '../entities/Player';
import { Enemy, type EnemyHost } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { pad, justPressed } from '../systems/input';
import { Audio } from '../audio/audio';
import { SaveSystem } from '../systems/save';
import { getSettings } from '@/stores/settingsStore';

const tw = (gx: number) => gx * TILE + TILE / 2;
const th = (gy: number) => HUD_H + gy * TILE + TILE / 2;

export class GameScene extends Phaser.Scene implements EnemyHost {
  player!: Player;
  private level!: LevelData;
  private grid!: number[][];
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private blockSprites = new Map<string, Phaser.Physics.Arcade.Sprite>();
  private enemies!: Phaser.GameObjects.Group;
  private fireballs!: Phaser.GameObjects.Group;
  private shots!: Phaser.GameObjects.Group;
  private itemSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private doorSprite!: Phaser.Physics.Arcade.Sprite;
  private keySprite: Phaser.Physics.Arcade.Sprite | null = null;
  private boss: Boss | null = null;
  private hasKey = false;
  private doorOpen = false;
  private finishing = false;
  private timeLeft = 0;
  private spawnPoint = { x: 0, y: 0 };
  private hudText!: Phaser.GameObjects.Text;
  private hudRight!: Phaser.GameObjects.Text;
  private bossBar: Phaser.GameObjects.Rectangle | null = null;
  private secretTaken = false;
  private coinsLeft = 0;
  private levelStats = { score: 0, items: 0, secrets: 0, enemies: 0 };

  constructor() {
    super('Game');
  }

  init(data: { levelId: number }) {
    this.level = getLevel(data.levelId);
    this.grid = this.level.grid.map((r) => [...r]);
    this.hasKey = false;
    this.doorOpen = false;
    this.finishing = false;
    this.secretTaken = false;
    this.boss = null;
    this.keySprite = null;
    this.bossBar = null;
    this.blockSprites.clear();
    this.itemSprites = [];
    this.levelStats = { score: 0, items: 0, secrets: 0, enemies: 0 };
  }

  create() {
    const world = this.level.world;
    const tint = WORLD_TINTS[Math.min(world, WORLD_TINTS.length - 1)];
    const hc = getSettings().highContrast;

    // background + constellation stars
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, hc ? 0x000000 : 0x0a0a23);
    if (!hc) {
      const rng = Math.abs(Math.sin(this.level.id * 999));
      for (let i = 0; i < 26; i++) {
        const sx = ((i * 137 + this.level.id * 61) % (GAME_W - 16)) + 8;
        const sy = HUD_H + ((i * 89 + this.level.id * 37) % (GRID_H * TILE - 16)) + 8;
        this.add
          .rectangle(sx, sy, 2, 2, i % 4 === 0 ? 0xffc83c : 0x3d3d7a)
          .setAlpha(0.4 + ((i + rng) % 5) * 0.1);
      }
    }

    this.physics.world.setBounds(TILE, HUD_H + TILE, (GRID_W - 2) * TILE, (GRID_H - 2) * TILE);
    this.solids = this.physics.add.staticGroup();
    this.enemies = this.add.group();
    this.fireballs = this.add.group();
    this.shots = this.add.group();

    // build tiles
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const t = this.grid[y][x];
        if (t === Tile.Stone) {
          const s = this.solids.create(tw(x), th(y), 'tile-stone') as Phaser.Physics.Arcade.Sprite;
          s.setTint(tint);
        } else if (t === Tile.Magic) {
          this.addMagicBlock(x, y, false);
        } else if (t === Tile.Spawn) {
          this.spawnPoint = { x: tw(x), y: th(y) };
        } else if (t === Tile.Door) {
          this.doorSprite = this.physics.add.staticSprite(tw(x), th(y), 'door-closed');
        } else if (t === Tile.Key) {
          this.keySprite = this.physics.add.staticSprite(tw(x), th(y), 'item-key');
          this.tweens.add({
            targets: this.keySprite,
            y: th(y) - 3,
            duration: 700,
            yoyo: true,
            repeat: -1
          });
        } else if (t === Tile.Secret) {
          // hidden seal: invisible trigger
          const zone = this.add.zone(tw(x), th(y), TILE, TILE);
          this.physics.add.existing(zone, true);
          this.time.delayedCall(0, () => {
            this.physics.add.overlap(this.player, zone as any, () => this.foundSecret(x, y));
          });
        }
      }
    }

    // items
    this.coinsLeft = this.level.items.filter((i) => i.type === 'coin').length;
    for (const it of this.level.items) {
      const spr = this.physics.add.staticSprite(tw(it.x), th(it.y), `item-${it.type}`);
      spr.setData('itype', it.type);
      spr.setData('hidden', !!it.hidden);
      if (it.hidden) {
        spr.setVisible(false);
        (spr.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      }
      this.itemSprites.push(spr);
    }

    // player
    this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y);
    this.player.invulnUntil = this.time.now + 1200;

    // enemies
    for (const e of this.level.enemies) this.spawnEnemy(e.x, e.y, e.type, null);

    // portals (unlimited spawning: max active + cooldown + difficulty scaling)
    for (let i = 0; i < this.level.portals.length; i++) {
      const p = this.level.portals[i];
      const spr = this.add.sprite(tw(p.x), th(p.y), 'portal');
      this.tweens.add({ targets: spr, angle: 360, duration: 3000, repeat: -1 });
      this.time.addEvent({
        delay: p.cooldown,
        loop: true,
        callback: () => {
          if (this.finishing || !this.player.alive) return;
          const active = this.enemies
            .getChildren()
            .filter((c) => (c as Enemy).fromPortal === `p${i}` && c.active).length;
          if (active < p.max) {
            const e = this.spawnEnemy(p.x, p.y, p.type, `p${i}`);
            e.setScale(0.2);
            this.tweens.add({ targets: e, scale: 1, duration: 300 });
          }
        }
      });
    }

    // boss
    if (this.level.boss) {
      this.boss = new Boss(this, GAME_W / 2, HUD_H + 3 * TILE, this.level.boss);
      this.physics.add.overlap(this.player, this.boss, () => this.onPlayerHit());
      this.add
        .text(GAME_W / 2, HUD_H + 8, BOSS_NAMES[this.level.boss], {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ff7f27'
        })
        .setOrigin(0.5, 0)
        .setDepth(20);
      this.add.rectangle(GAME_W / 2, HUD_H + 26, 102, 8, 0x101018).setDepth(20);
      this.bossBar = this.add.rectangle(GAME_W / 2 - 50, HUD_H + 26, 100, 6, 0xe23b3b)
        .setOrigin(0, 0.5)
        .setDepth(21);
    }

    // physics wiring
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(
      this.enemies,
      this.solids,
      undefined,
      (e) => (e as Enemy).collidesWithWorld
    );
    if (this.boss) this.physics.add.collider(this.boss, this.solids);
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      if ((e as Enemy).active) this.onPlayerHit();
    });
    this.physics.add.overlap(this.player, this.shots, (_p, s) => {
      if ((s as Phaser.GameObjects.GameObject).active) {
        (s as Phaser.Physics.Arcade.Image).destroy();
        this.onPlayerHit();
      }
    });
    this.physics.add.collider(this.shots, this.solids, (s) =>
      (s as Phaser.Physics.Arcade.Image).destroy()
    );
    this.physics.add.overlap(this.fireballs, this.enemies, (f, e) => this.fireballHit(f as any, e as Enemy));
    if (this.boss) {
      this.physics.add.overlap(this.fireballs, this.boss, (b, f) => {
        const fb = (f === this.boss ? b : f) as Phaser.Physics.Arcade.Image;
        fb.destroy();
        this.hitBoss();
      });
    }
    this.physics.add.collider(this.fireballs, this.solids, (f) => {
      this.spark((f as any).x, (f as any).y);
      (f as Phaser.Physics.Arcade.Image).destroy();
    });
    if (this.keySprite) {
      this.physics.add.overlap(this.player, this.keySprite, () => this.pickKey());
    }
    this.physics.add.overlap(this.player, this.doorSprite, () => this.tryExit());
    for (const spr of this.itemSprites) {
      this.physics.add.overlap(this.player, spr, () => this.pickItem(spr));
    }

    // HUD
    this.add.rectangle(GAME_W / 2, HUD_H / 2, GAME_W, HUD_H, hc ? 0x000000 : 0x101030).setDepth(30);
    this.hudText = this.add
      .text(4, 5, '', { fontFamily: 'monospace', fontSize: '10px', color: '#ffc83c' })
      .setDepth(31);
    this.hudRight = this.add
      .text(GAME_W - 4, 5, '', { fontFamily: 'monospace', fontSize: '10px', color: '#f4f4f4' })
      .setOrigin(1, 0)
      .setDepth(31);

    // timer
    this.timeLeft = this.level.time;
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.finishing || !this.player.alive) return;
        this.timeLeft--;
        if (this.timeLeft <= 0) this.killPlayer();
      }
    });

    Audio.setWorld(world);
    Audio.music(this.level.boss ? 'boss' : 'world');
    window.dispatchEvent(new CustomEvent('mk-scene', { detail: 'Game' }));
  }

  /* ---------------- helpers ---------------- */

  private addMagicBlock(x: number, y: number, animated: boolean) {
    const s = this.solids.create(tw(x), th(y), 'tile-magic') as Phaser.Physics.Arcade.Sprite;
    s.setData('magic', true);
    this.grid[y][x] = Tile.Magic;
    this.blockSprites.set(`${x},${y}`, s);
    if (animated) {
      s.setScale(0.2);
      this.tweens.add({ targets: s, scale: 1, duration: 120, onComplete: () => s.refreshBody() });
    }
    return s;
  }

  private spawnEnemy(gx: number, gy: number, type: any, portal: string | null) {
    const e = new Enemy(this, tw(gx), th(gy), type);
    e.fromPortal = portal;
    this.enemies.add(e);
    return e;
  }

  fireEnemyShot(x: number, y: number, txx: number, tyy: number) {
    const s = this.physics.add.image(x, y, 'shot');
    (s.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    const dx = txx - x;
    const dy = tyy - y;
    const len = Math.max(1, Math.hypot(dx, dy));
    s.setVelocity((dx / len) * 110, (dy / len) * 110);
    this.shots.add(s);
    this.time.delayedCall(4000, () => s.active && s.destroy());
  }

  private spark(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      const p = this.add.image(x, y, 'spark');
      this.tweens.add({
        targets: p,
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 24,
        alpha: 0,
        duration: 250,
        onComplete: () => p.destroy()
      });
    }
  }

  private gridAt(gx: number, gy: number) {
    if (gx < 0 || gy < 0 || gx >= GRID_W || gy >= GRID_H) return Tile.Stone;
    return this.grid[gy][gx];
  }

  private playerCell() {
    return {
      x: Math.floor(this.player.x / TILE),
      y: Math.floor((this.player.y - HUD_H) / TILE)
    };
  }

  private cellFree(gx: number, gy: number): boolean {
    if (this.gridAt(gx, gy) !== Tile.Empty) return false;
    const rect = new Phaser.Geom.Rectangle(gx * TILE, HUD_H + gy * TILE, TILE, TILE);
    // cannot create inside enemy
    for (const e of this.enemies.getChildren() as Enemy[]) {
      if (e.active && Phaser.Geom.Rectangle.Overlaps(rect, e.getBounds())) return false;
    }
    if (this.boss && Phaser.Geom.Rectangle.Overlaps(rect, this.boss.getBounds())) return false;
    // cannot create inside player
    if (Phaser.Geom.Rectangle.Overlaps(rect, this.player.getBounds())) return false;
    // don't bury items / door / key
    for (const it of this.itemSprites) {
      if (it.active && Phaser.Geom.Rectangle.Overlaps(rect, it.getBounds())) return false;
    }
    if (Phaser.Geom.Rectangle.Overlaps(rect, this.doorSprite.getBounds())) return false;
    if (this.keySprite?.active && Phaser.Geom.Rectangle.Overlaps(rect, this.keySprite.getBounds()))
      return false;
    return true;
  }

  private tryCreateBlock() {
    const c = this.playerCell();
    const f = this.player.facing;
    // front cell, then diagonal front-below (classic wizardry)
    const targets = [
      { x: c.x + f, y: c.y },
      { x: c.x + f, y: c.y + 1 }
    ];
    for (const t of targets) {
      if (t.x <= 0 || t.x >= GRID_W - 1 || t.y <= 0 || t.y >= GRID_H - 1) continue;
      if (this.cellFree(t.x, t.y)) {
        this.addMagicBlock(t.x, t.y, true);
        Audio.sfx('create');
        this.player.showCast();
        return;
      }
    }
  }

  private tryDestroyBlock() {
    const c = this.playerCell();
    const f = this.player.facing;
    const targets = [
      { x: c.x + f, y: c.y },
      { x: c.x + f, y: c.y + 1 },
      { x: c.x + f, y: c.y - 1 }
    ];
    for (const t of targets) {
      if (this.gridAt(t.x, t.y) === Tile.Magic) {
        const spr = this.blockSprites.get(`${t.x},${t.y}`);
        this.grid[t.y][t.x] = Tile.Empty;
        this.blockSprites.delete(`${t.x},${t.y}`);
        if (spr) {
          this.spark(spr.x, spr.y);
          this.tweens.add({
            targets: spr,
            scale: 0,
            alpha: 0,
            duration: 140,
            onComplete: () => spr.destroy()
          });
          (spr.body as Phaser.Physics.Arcade.StaticBody).enable = false;
        }
        Audio.sfx('break');
        this.player.showCast();
        return;
      }
    }
  }

  private shootFireball() {
    const upgraded = this.registry.get('fire') === true;
    const range = (upgraded ? FIREBALL_RANGE_UPGRADED : FIREBALL_RANGE_TILES) * TILE;
    const f = this.physics.add.image(
      this.player.x + this.player.facing * 10,
      this.player.y,
      'fireball'
    );
    (f.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    f.setVelocityX(this.player.facing * FIREBALL_SPEED);
    f.setData('startX', f.x);
    f.setData('range', range);
    f.setData('power', upgraded ? 2 : 1);
    this.fireballs.add(f);
    Audio.sfx('fireball');
    this.player.showCast();
  }

  private fireballHit(f: Phaser.Physics.Arcade.Image, e: Enemy) {
    if (!f.active || !e.active) return;
    const power = (f.getData('power') as number) ?? 1;
    f.destroy();
    // phantoms shrug off basic fireballs - upgrade required
    if (e.etype === 'phantom' && power < 2) {
      this.spark(e.x, e.y);
      return;
    }
    if (e.damage(power)) {
      this.spark(e.x, e.y);
      e.destroy();
      this.addScore(POINTS.enemy);
      this.levelStats.enemies++;
      this.registry.inc('enemiesDefeated', 1);
      Audio.sfx('break');
    } else {
      e.setTintFill(0xffffff);
      this.time.delayedCall(60, () => e.clearTint());
    }
  }

  private hitBoss() {
    if (!this.boss || this.finishing) return;
    const dead = this.boss.damage(this.registry.get('fire') === true ? 2 : 1);
    if (this.bossBar) this.bossBar.width = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
    if (dead) {
      const b = this.boss;
      this.boss = null;
      for (let i = 0; i < 14; i++)
        this.time.delayedCall(i * 70, () =>
          this.spark(b.x + (Math.random() - 0.5) * 40, b.y + (Math.random() - 0.5) * 40)
        );
      this.tweens.add({ targets: b, alpha: 0, duration: 900, onComplete: () => b.destroy() });
      this.addScore(POINTS.boss);
      this.levelStats.enemies++;
      this.hasKey = true;
      this.openDoor();
      Audio.sfx('secret');
    }
  }

  private addScore(n: number) {
    this.levelStats.score += n;
    this.registry.inc('runScore', n);
  }

  private pickKey() {
    if (!this.keySprite?.active) return;
    this.keySprite.destroy();
    this.keySprite = null;
    this.hasKey = true;
    Audio.sfx('key');
    this.openDoor();
  }

  private openDoor() {
    if (this.doorOpen) return;
    this.doorOpen = true;
    this.doorSprite.setTexture('door-open');
    Audio.sfx('door');
  }

  private pickItem(spr: Phaser.Physics.Arcade.Sprite) {
    if (!spr.active || !spr.visible) return;
    const type = spr.getData('itype') as ItemType;
    spr.destroy();
    this.levelStats.items++;
    this.registry.inc('itemsCollected', 1);
    switch (type) {
      case 'coin':
        this.addScore(POINTS.coin);
        Audio.sfx('coin');
        this.coinsLeft--;
        if (this.coinsLeft === 0) this.revealHiddenItems();
        break;
      case 'gem':
        this.addScore(POINTS.gem);
        Audio.sfx('gem');
        break;
      case 'chest':
        this.addScore(POINTS.chest);
        Audio.sfx('chest');
        break;
      case 'life':
        this.registry.inc('lives', 1);
        Audio.sfx('secret');
        break;
      case 'time':
        this.timeLeft += 30;
        Audio.sfx('chest');
        break;
      case 'fire':
        this.registry.set('fire', true);
        this.addScore(POINTS.fire);
        Audio.sfx('secret');
        break;
      case 'seal':
        this.collectSeal();
        break;
      case 'crown':
        this.addScore(POINTS.crown);
        SaveSystem.update((s) => {
          if (!s.crowns.includes(this.level.id)) s.crowns.push(this.level.id);
        });
        Audio.sfx('secret');
        break;
      case 'orb':
        this.addScore(POINTS.orb);
        SaveSystem.update((s) => {
          if (!s.orbs.includes(this.level.id)) s.orbs.push(this.level.id);
        });
        Audio.sfx('secret');
        break;
    }
  }

  private revealHiddenItems() {
    // hidden item puzzle: collecting every coin reveals the bonus treasure
    for (const spr of this.itemSprites) {
      if (spr.active && spr.getData('hidden')) {
        spr.setVisible(true);
        (spr.body as Phaser.Physics.Arcade.StaticBody).enable = true;
        this.spark(spr.x, spr.y);
      }
    }
    Audio.sfx('secret');
  }

  private foundSecret(gx: number, gy: number) {
    if (this.secretTaken) return;
    this.secretTaken = true;
    const spr = this.physics.add.staticSprite(tw(gx), th(gy), 'item-seal');
    spr.setData('itype', 'seal');
    this.itemSprites.push(spr);
    this.physics.add.overlap(this.player, spr, () => this.pickItem(spr));
    this.spark(tw(gx), th(gy));
    Audio.sfx('secret');
  }

  private collectSeal() {
    this.addScore(POINTS.seal);
    this.levelStats.secrets++;
    const world = this.level.world;
    SaveSystem.update((s) => {
      if (!s.seals.includes(world)) s.seals.push(world);
      s.secretsFound += 1;
      const secretId = secretLevelOfWorld(world);
      if (!s.secretsUnlocked.includes(secretId)) s.secretsUnlocked.push(secretId);
      // bonus secret stages at 4/8/12 seals
      for (const [need, lid] of [
        [4, 61],
        [8, 62],
        [12, 63]
      ] as const) {
        if (s.seals.length >= need && !s.secretsUnlocked.includes(lid))
          s.secretsUnlocked.push(lid);
      }
      if (s.seals.length >= 6) s.pages.time = true;
      if (s.seals.length >= 12) {
        s.pages.space = true;
        s.princessUnlocked = true;
      }
    });
    this.scene.launch('SecretFound', { text: 'SEAL OF ' + this.level.name.split(' ')[0].toUpperCase() });
  }

  private tryExit() {
    if (this.finishing || !this.doorOpen || !this.hasKey || !this.player.alive) return;
    this.finishing = true;
    Audio.music('victory');
    const timeBonus = this.timeLeft * POINTS.secondPerTimeBonus;
    this.addScore(timeBonus);
    const stats = { ...this.levelStats, timeLeft: this.timeLeft, timeBonus };
    SaveSystem.update((s) => {
      if (!s.completedStages.includes(this.level.id)) s.completedStages.push(this.level.id);
      if (this.level.id < 48) s.unlockedStage = Math.max(s.unlockedStage, this.level.id + 1);
      if (this.level.id === 48) s.unlockedStage = 49; // Solomon Chamber
      s.totalScore += stats.score;
      s.itemsCollected += stats.items;
      s.secretsFound += 0; // seals already counted
    });
    this.tweens.add({ targets: this.player, alpha: 0, scale: 0.3, duration: 500 });
    this.time.delayedCall(800, () => {
      Audio.stopMusic();
      if (this.level.id === FINAL_STAGE_ID) {
        this.scene.start('Credits', { victory: true });
      } else {
        this.scene.start('LevelComplete', { levelId: this.level.id, stats });
      }
    });
  }

  private onPlayerHit() {
    if (!this.player.alive || this.time.now < this.player.invulnUntil || this.finishing) return;
    this.killPlayer();
  }

  private killPlayer() {
    if (!this.player.alive) return;
    this.player.kill();
    this.registry.inc('lives', -1);
    const lives = this.registry.get('lives') as number;
    this.time.delayedCall(1400, () => {
      if (lives > 0) {
        // respawn in the same room
        this.scene.restart({ levelId: this.level.id });
      } else {
        Audio.stopMusic();
        this.scene.start('GameOver', { levelId: this.level.id });
      }
    });
  }

  update() {
    if (this.finishing) return;
    this.player.update();

    if (this.player.alive) {
      if (justPressed('create')) this.tryCreateBlock();
      if (justPressed('destroy')) this.tryDestroyBlock();
      if (justPressed('fire')) this.shootFireball();
    }
    if (justPressed('pause')) {
      Audio.sfx('pause');
      this.scene.launch('Pause', { levelId: this.level.id });
      this.scene.pause();
    }

    // fireball range limit
    for (const f of this.fireballs.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (!f.active) continue;
      if (Math.abs(f.x - (f.getData('startX') as number)) > (f.getData('range') as number)) {
        this.spark(f.x, f.y);
        f.destroy();
      }
    }

    // HUD
    const lives = this.registry.get('lives') ?? 3;
    const score = this.registry.get('runScore') ?? 0;
    const fire = this.registry.get('fire') ? ' F' : '';
    this.hudText.setText(
      `${this.level.name}  ♥${lives}${fire}${this.hasKey ? ' ⚿' : ''}`
    );
    this.hudRight.setText(`${String(score).padStart(6, '0')}  T:${Math.max(0, this.timeLeft)}`);
    if (this.timeLeft <= 10) this.hudRight.setColor(this.timeLeft % 2 ? '#e23b3b' : '#f4f4f4');
  }
}
