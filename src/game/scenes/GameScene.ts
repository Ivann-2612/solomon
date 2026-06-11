import * as Phaser from 'phaser';
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
import { pad, justPressed, resetPad } from '../systems/input';
import { Audio } from '../audio/audio';
import { SaveSystem } from '../systems/save';
import { getSettings } from '@/stores/settingsStore';

const tw = (gx: number) => gx * TILE + TILE / 2;
const th = (gy: number) => HUD_H + gy * TILE + TILE / 2;

// Zodiac constellation data: stars as [x,y] fractions of playfield, lines as [from,to] indices
const CONSTELLATIONS: { stars: [number, number][]; lines: [number, number][] }[] = [
  { stars: [[0.3,0.3],[0.5,0.2],[0.7,0.3]], lines: [[0,1],[1,2]] },                                         // Aries
  { stars: [[0.2,0.4],[0.35,0.2],[0.5,0.35],[0.65,0.2],[0.8,0.4]], lines: [[0,1],[1,2],[2,3],[3,4]] },      // Taurus
  { stars: [[0.25,0.2],[0.75,0.2],[0.25,0.5],[0.75,0.5],[0.25,0.75],[0.75,0.75]], lines: [[0,1],[2,3],[4,5],[0,2],[2,4],[1,3],[3,5]] }, // Gemini
  { stars: [[0.5,0.2],[0.35,0.45],[0.65,0.45],[0.5,0.7]], lines: [[0,1],[0,2],[1,3],[2,3]] },               // Cancer
  { stars: [[0.2,0.5],[0.35,0.3],[0.5,0.2],[0.65,0.3],[0.75,0.5],[0.6,0.7]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5]] }, // Leo
  { stars: [[0.5,0.2],[0.35,0.4],[0.65,0.4],[0.3,0.65],[0.7,0.65]], lines: [[0,1],[0,2],[1,3],[2,4]] },     // Virgo
  { stars: [[0.2,0.35],[0.5,0.25],[0.8,0.35],[0.2,0.65],[0.5,0.75],[0.8,0.65]], lines: [[0,1],[1,2],[3,4],[4,5],[0,3],[2,5]] }, // Libra
  { stars: [[0.2,0.2],[0.35,0.35],[0.5,0.3],[0.65,0.4],[0.75,0.55],[0.8,0.7],[0.7,0.8],[0.55,0.75]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]] }, // Scorpio
  { stars: [[0.3,0.6],[0.5,0.4],[0.7,0.6],[0.5,0.2],[0.5,0.7]], lines: [[0,1],[1,2],[1,3],[0,4],[2,4]] },  // Sagittarius
  { stars: [[0.25,0.3],[0.4,0.2],[0.6,0.3],[0.75,0.5],[0.6,0.7],[0.4,0.7]], lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]] }, // Capricorn
  { stars: [[0.2,0.35],[0.4,0.25],[0.6,0.25],[0.8,0.35],[0.2,0.65],[0.4,0.55],[0.6,0.55],[0.8,0.65]], lines: [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7]] }, // Aquarius
  { stars: [[0.25,0.3],[0.4,0.5],[0.5,0.2],[0.6,0.5],[0.75,0.3],[0.5,0.75]], lines: [[0,1],[1,2],[2,3],[3,4],[1,5],[3,5]] }  // Pisces
];

type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;

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

  // effect emitters
  private emGold!: Emitter;
  private emPurple!: Emitter;
  private emOrange!: Emitter;
  private emRed!: Emitter;
  private emWhite!: Emitter;
  private emCyan!: Emitter;
  private emGreen!: Emitter;

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
    resetPad(); // clear any stuck keys from previous scene
  }

  create() {
    const world = this.level.world;
    const tint = WORLD_TINTS[Math.min(world, WORLD_TINTS.length - 1)];
    const hc = getSettings().highContrast;

    this.createBackground(world, hc);
    this.setupParticles();

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
            y: th(y) - 4,
            duration: 700,
            yoyo: true,
            repeat: -1
          });
          this.addGlow(this.keySprite, 0xffc83c, 3);
        } else if (t === Tile.Secret) {
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

    // portals
    for (let i = 0; i < this.level.portals.length; i++) {
      const p = this.level.portals[i];
      const spr = this.add.sprite(tw(p.x), th(p.y), 'portal');
      this.tweens.add({ targets: spr, angle: 360, duration: 3000, repeat: -1 });
      this.addGlow(spr, 0x8c4bd9, 2);
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
      this.addGlow(this.boss, 0xe23b3b, 2);
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
      this.burst((f as any).x, (f as any).y, this.emOrange, 6);
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
    // world-color accent bar at bottom of HUD
    this.add.rectangle(GAME_W / 2, HUD_H - 1, GAME_W, 2, tint).setDepth(31).setAlpha(0.6);
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

  /* ---- background ---- */

  private createBackground(world: number, hc: boolean) {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, hc ? 0x000000 : 0x0a0a23);
    if (hc) return;

    const gfx = this.add.graphics();
    const tint = WORLD_TINTS[Math.min(world, WORLD_TINTS.length - 1)];
    const r = ((tint >> 16) & 0xff) / 255;
    const g = ((tint >> 8) & 0xff) / 255;
    const b = (tint & 0xff) / 255;

    // constellation lines
    const ci = world % CONSTELLATIONS.length;
    const con = CONSTELLATIONS[ci];
    const pfW = GAME_W;
    const pfH = GAME_H - HUD_H;
    const pfY = HUD_H;
    gfx.lineStyle(1, tint, 0.12);
    for (const [from, to] of con.lines) {
      const [x1, y1] = con.stars[from];
      const [x2, y2] = con.stars[to];
      gfx.lineBetween(x1 * pfW, pfY + y1 * pfH, x2 * pfW, pfY + y2 * pfH);
    }

    // constellation stars (bright)
    for (const [sx, sy] of con.stars) {
      this.add
        .rectangle(sx * pfW, pfY + sy * pfH, 3, 3, tint)
        .setAlpha(0.55);
    }

    // random background stars with twinkling
    const starCount = 28;
    for (let i = 0; i < starCount; i++) {
      const sx = ((i * 137 + this.level.id * 61) % (GAME_W - 12)) + 6;
      const sy = HUD_H + ((i * 89 + this.level.id * 37) % (pfH - 12)) + 6;
      const size = i % 5 === 0 ? 2 : 1;
      const col = i % 5 === 0 ? tint : 0x3d3d7a;
      const alpha = 0.3 + (i % 4) * 0.1;
      const star = this.add.rectangle(sx, sy, size, size, col).setAlpha(alpha);
      // twinkle
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.25,
        duration: 800 + (i % 7) * 200,
        yoyo: true,
        repeat: -1,
        delay: (i * 113) % 800
      });
    }
  }

  /* ---- particles ---- */

  private setupParticles() {
    const cfg = (tkey: string): Phaser.Types.GameObjects.Particles.ParticleEmitterConfig => ({
      speed: { min: 40, max: 110 },
      scale: { start: 1, end: 0 },
      lifespan: { min: 280, max: 480 },
      gravityY: 120,
      emitting: false,
      quantity: 1
    });
    this.emGold    = this.add.particles(0, 0, 'px-gold',    cfg('px-gold')).setDepth(18);
    this.emPurple  = this.add.particles(0, 0, 'px-purple',  cfg('px-purple')).setDepth(18);
    this.emOrange  = this.add.particles(0, 0, 'px-orange',  cfg('px-orange')).setDepth(18);
    this.emRed     = this.add.particles(0, 0, 'px-red',     cfg('px-red')).setDepth(18);
    this.emWhite   = this.add.particles(0, 0, 'px-white',   cfg('px-white')).setDepth(18);
    this.emCyan    = this.add.particles(0, 0, 'px-cyan',    cfg('px-cyan')).setDepth(18);
    this.emGreen   = this.add.particles(0, 0, 'px-green',   cfg('px-green')).setDepth(18);
  }

  private burst(x: number, y: number, emitter: Emitter, count: number) {
    emitter.explode(count, x, y);
  }

  private floatScore(x: number, y: number, pts: number) {
    if (pts <= 0) return;
    const t = this.add
      .text(x, y, `+${pts}`, { fontFamily: 'monospace', fontSize: '9px', color: '#ffc83c' })
      .setOrigin(0.5, 1)
      .setDepth(50);
    this.tweens.add({
      targets: t,
      y: y - 22,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.Out',
      onComplete: () => t.destroy()
    });
  }

  /* ---- PostFX glow (WebGL only) ---- */

  private addGlow(obj: Phaser.GameObjects.GameObject, color: number, strength = 2) {
    try {
      const go = obj as any;
      if (go.preFX) {
        const fx = go.preFX.addGlow(color, strength, 0, false, 0.1, 12);
        this.tweens.add({
          targets: fx,
          outerStrength: strength * 2,
          duration: 700,
          yoyo: true,
          repeat: -1
        });
      }
    } catch {
      // canvas renderer: ignore
    }
  }

  /* ---------------- helpers ---------------- */

  private addMagicBlock(x: number, y: number, animated: boolean) {
    const s = this.solids.create(tw(x), th(y), 'tile-magic') as Phaser.Physics.Arcade.Sprite;
    s.setData('magic', true);
    this.grid[y][x] = Tile.Magic;
    this.blockSprites.set(`${x},${y}`, s);
    if (animated) {
      s.setScale(0.2);
      this.burst(tw(x), th(y), this.emPurple, 8);
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
    this.burst(x, y, this.emGold, 5);
    this.burst(x, y, this.emWhite, 3);
    // fallback for canvas: old image-based sparks
    for (let i = 0; i < 3; i++) {
      const p = this.add.image(x, y, 'spark').setDepth(17);
      this.tweens.add({
        targets: p,
        x: x + (Math.random() - 0.5) * 22,
        y: y + (Math.random() - 0.5) * 22,
        alpha: 0,
        duration: 220,
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
    for (const e of this.enemies.getChildren() as Enemy[]) {
      if (e.active && Phaser.Geom.Rectangle.Overlaps(rect, e.getBounds())) return false;
    }
    if (this.boss && Phaser.Geom.Rectangle.Overlaps(rect, this.boss.getBounds())) return false;
    if (Phaser.Geom.Rectangle.Overlaps(rect, this.player.getBounds())) return false;
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
    // Try positions: in front (same row), in front below, directly below, in front above
    const targets = [
      { x: c.x + f, y: c.y },
      { x: c.x + f, y: c.y + 1 },
      { x: c.x + f, y: c.y - 1 },
      { x: c.x,     y: c.y - 1 }
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
    // visual feedback on fail: small red flash
    this.cameras.main.shake(60, 0.002);
  }

  private tryDestroyBlock() {
    const c = this.playerCell();
    const f = this.player.facing;
    const targets = [
      { x: c.x + f, y: c.y },
      { x: c.x + f, y: c.y + 1 },
      { x: c.x + f, y: c.y - 1 },
      { x: c.x,     y: c.y - 1 }
    ];
    for (const t of targets) {
      if (this.gridAt(t.x, t.y) === Tile.Magic) {
        const spr = this.blockSprites.get(`${t.x},${t.y}`);
        this.grid[t.y][t.x] = Tile.Empty;
        this.blockSprites.delete(`${t.x},${t.y}`);
        if (spr) {
          this.burst(spr.x, spr.y, this.emPurple, 10);
          this.burst(spr.x, spr.y, this.emWhite, 4);
          this.tweens.add({
            targets: spr,
            scale: 0,
            alpha: 0,
            duration: 130,
            onComplete: () => spr.destroy()
          });
          (spr.body as Phaser.Physics.Arcade.StaticBody).enable = false;
        }
        Audio.sfx('break');
        this.player.showCast();
        return;
      }
    }
    this.cameras.main.shake(60, 0.002);
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

    // fireball trail
    const trail = this.add.particles(0, 0, upgraded ? 'px-yellow' : 'px-orange', {
      speed: { min: 10, max: 35 },
      scale: { start: 0.8, end: 0 },
      lifespan: 180,
      quantity: 2,
      follow: f
    }).setDepth(15);
    f.setData('trail', trail);

    this.fireballs.add(f);
    Audio.sfx('fireball');
    this.player.showCast();
  }

  private fireballHit(f: Phaser.Physics.Arcade.Image, e: Enemy) {
    if (!f.active || !e.active) return;
    const power = (f.getData('power') as number) ?? 1;
    const trail = f.getData('trail') as Emitter | null;
    if (trail) { trail.stop(); this.time.delayedCall(300, () => trail.destroy()); }
    f.destroy();
    if (e.etype === 'phantom' && power < 2) {
      this.burst(e.x, e.y, this.emCyan, 5);
      return;
    }
    if (e.damage(power)) {
      const em = this.enemyEmitter(e.etype);
      this.burst(e.x, e.y, em, 12);
      this.burst(e.x, e.y, this.emOrange, 5);
      e.destroy();
      this.addScore(POINTS.enemy);
      this.floatScore(e.x, e.y, POINTS.enemy);
      this.levelStats.enemies++;
      this.registry.inc('enemiesDefeated', 1);
      Audio.sfx('break');
    } else {
      e.setTintFill(0xffffff);
      this.time.delayedCall(60, () => e.clearTint());
      this.cameras.main.shake(50, 0.003);
    }
  }

  private enemyEmitter(etype: string): Emitter {
    switch (etype) {
      case 'bat':      return this.emRed;
      case 'skull':    return this.emWhite;
      case 'phantom':  return this.emCyan;
      case 'gargoyle': return this.emGreen;
      default:         return this.emRed;
    }
  }

  private hitBoss() {
    if (!this.boss || this.finishing) return;
    const dead = this.boss.damage(this.registry.get('fire') === true ? 2 : 1);
    if (this.bossBar) this.bossBar.width = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
    this.cameras.main.shake(80, 0.006);
    if (dead) {
      const b = this.boss;
      this.boss = null;
      for (let i = 0; i < 14; i++) {
        this.time.delayedCall(i * 70, () => {
          this.burst(b.x + (Math.random() - 0.5) * 40, b.y + (Math.random() - 0.5) * 40, this.emOrange, 8);
          this.burst(b.x + (Math.random() - 0.5) * 40, b.y + (Math.random() - 0.5) * 40, this.emRed, 5);
        });
      }
      this.tweens.add({ targets: b, alpha: 0, duration: 900, onComplete: () => b.destroy() });
      this.cameras.main.shake(300, 0.01);
      this.cameras.main.flash(400, 255, 127, 0, true);
      this.addScore(POINTS.boss);
      this.floatScore(b.x, b.y - 16, POINTS.boss);
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
    const kx = this.keySprite.x;
    const ky = this.keySprite.y;
    this.keySprite.destroy();
    this.keySprite = null;
    this.hasKey = true;
    this.burst(kx, ky, this.emGold, 16);
    this.burst(kx, ky, this.emWhite, 8);
    this.cameras.main.flash(150, 255, 200, 0, true);
    Audio.sfx('key');
    this.openDoor();
  }

  private openDoor() {
    if (this.doorOpen) return;
    this.doorOpen = true;
    this.doorSprite.setTexture('door-open');
    this.burst(this.doorSprite.x, this.doorSprite.y, this.emGold, 12);
    this.addGlow(this.doorSprite, 0xffe89a, 3);
    Audio.sfx('door');
  }

  private pickItem(spr: Phaser.Physics.Arcade.Sprite) {
    if (!spr.active || !spr.visible) return;
    const type = spr.getData('itype') as ItemType;
    const ix = spr.x;
    const iy = spr.y;
    spr.destroy();
    this.levelStats.items++;
    this.registry.inc('itemsCollected', 1);
    switch (type) {
      case 'coin':
        this.burst(ix, iy, this.emGold, 7);
        this.addScore(POINTS.coin);
        this.floatScore(ix, iy, POINTS.coin);
        Audio.sfx('coin');
        this.coinsLeft--;
        if (this.coinsLeft === 0) this.revealHiddenItems();
        break;
      case 'gem':
        this.burst(ix, iy, this.emCyan, 8);
        this.burst(ix, iy, this.emGreen, 4);
        this.addScore(POINTS.gem);
        this.floatScore(ix, iy, POINTS.gem);
        Audio.sfx('gem');
        break;
      case 'chest':
        this.burst(ix, iy, this.emGold, 14);
        this.burst(ix, iy, this.emOrange, 6);
        this.addScore(POINTS.chest);
        this.floatScore(ix, iy, POINTS.chest);
        Audio.sfx('chest');
        break;
      case 'life':
        this.burst(ix, iy, this.emRed, 10);
        this.registry.inc('lives', 1);
        Audio.sfx('secret');
        break;
      case 'time':
        this.burst(ix, iy, this.emWhite, 8);
        this.timeLeft += 30;
        Audio.sfx('chest');
        break;
      case 'fire':
        this.burst(ix, iy, this.emOrange, 12);
        this.burst(ix, iy, this.emGold, 6);
        this.registry.set('fire', true);
        this.addScore(POINTS.fire);
        this.floatScore(ix, iy, POINTS.fire);
        Audio.sfx('secret');
        break;
      case 'seal':
        this.collectSeal();
        break;
      case 'crown':
        this.burst(ix, iy, this.emGold, 20);
        this.addScore(POINTS.crown);
        this.floatScore(ix, iy, POINTS.crown);
        SaveSystem.update((s) => {
          if (!s.crowns.includes(this.level.id)) s.crowns.push(this.level.id);
        });
        Audio.sfx('secret');
        break;
      case 'orb':
        this.burst(ix, iy, this.emCyan, 16);
        this.addScore(POINTS.orb);
        this.floatScore(ix, iy, POINTS.orb);
        SaveSystem.update((s) => {
          if (!s.orbs.includes(this.level.id)) s.orbs.push(this.level.id);
        });
        Audio.sfx('secret');
        break;
    }
  }

  private revealHiddenItems() {
    for (const spr of this.itemSprites) {
      if (spr.active && spr.getData('hidden')) {
        spr.setVisible(true);
        (spr.body as Phaser.Physics.Arcade.StaticBody).enable = true;
        this.burst(spr.x, spr.y, this.emGold, 8);
      }
    }
    this.cameras.main.flash(200, 255, 200, 60, true);
    Audio.sfx('secret');
  }

  private foundSecret(gx: number, gy: number) {
    if (this.secretTaken) return;
    this.secretTaken = true;
    const spr = this.physics.add.staticSprite(tw(gx), th(gy), 'item-seal');
    spr.setData('itype', 'seal');
    this.itemSprites.push(spr);
    this.physics.add.overlap(this.player, spr, () => this.pickItem(spr));
    this.burst(tw(gx), th(gy), this.emPurple, 20);
    this.burst(tw(gx), th(gy), this.emGold, 10);
    this.cameras.main.flash(250, 140, 75, 217, true);
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
      if (this.level.id === 48) s.unlockedStage = 49;
      s.totalScore += stats.score;
      s.itemsCollected += stats.items;
      s.secretsFound += 0;
    });
    this.cameras.main.flash(300, 255, 232, 100, true);
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
    this.cameras.main.shake(120, 0.007);
    this.cameras.main.flash(80, 230, 59, 59, true);
    this.killPlayer();
  }

  private killPlayer() {
    if (!this.player.alive) return;
    this.player.kill();
    this.burst(this.player.x, this.player.y, this.emRed, 14);
    this.burst(this.player.x, this.player.y, this.emOrange, 8);
    this.cameras.main.shake(200, 0.012);
    this.cameras.main.flash(200, 230, 59, 59, true);
    this.registry.inc('lives', -1);
    const lives = this.registry.get('lives') as number;
    this.time.delayedCall(1400, () => {
      if (lives > 0) {
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
        this.burst(f.x, f.y, this.emOrange, 4);
        const trail = f.getData('trail') as Emitter | null;
        if (trail) { trail.stop(); this.time.delayedCall(300, () => trail.destroy()); }
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
    else this.hudRight.setColor('#f4f4f4');
  }
}
