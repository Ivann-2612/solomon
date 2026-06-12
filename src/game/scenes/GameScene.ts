import * as Phaser from "phaser";
import { Tile } from "@/types";
import type { RoomData, ItemType } from "@/types";
import {
  TILE,
  HUD_H,
  GAME_W,
  GAME_H,
  GRID_W,
  GRID_H,
  POINTS,
  FIREBALL_SPEED,
  FINAL_STAGE_ID,
  constellationOfRoom,
} from "../constants";
import { getRoom, roomTitle, nextRoom, wingsTarget } from "../levels/registry";
import { WORLD_TINTS } from "../assets/palette";
import { Player } from "../entities/Player";
import { Enemy, type EnemyHost } from "../entities/Enemy";
import { pad, justPressed, resetPad } from "../systems/input";
import { Audio } from "../audio/audio";
import { SaveSystem } from "../systems/save";
import { getSettings } from "@/stores/settingsStore";
import { BonusCounter } from "../systems/scoring";
import { Inventory } from "../systems/inventory";
import { applyItem, type ItemCtx } from "../systems/items";

const tw = (gx: number) => gx * TILE + TILE / 2;
const th = (gy: number) => gy * TILE + TILE / 2;

// Zodiac constellation data
const CONSTELLATIONS: {
  stars: [number, number][];
  lines: [number, number][];
}[] = [
  {
    stars: [
      [0.3, 0.3],
      [0.5, 0.2],
      [0.7, 0.3],
    ],
    lines: [
      [0, 1],
      [1, 2],
    ],
  },
  {
    stars: [
      [0.2, 0.4],
      [0.35, 0.2],
      [0.5, 0.35],
      [0.65, 0.2],
      [0.8, 0.4],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    stars: [
      [0.25, 0.2],
      [0.75, 0.2],
      [0.25, 0.5],
      [0.75, 0.5],
      [0.25, 0.75],
      [0.75, 0.75],
    ],
    lines: [
      [0, 1],
      [2, 3],
      [4, 5],
      [0, 2],
      [2, 4],
      [1, 3],
      [3, 5],
    ],
  },
  {
    stars: [
      [0.5, 0.2],
      [0.35, 0.45],
      [0.65, 0.45],
      [0.5, 0.7],
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
  },
  {
    stars: [
      [0.2, 0.5],
      [0.35, 0.3],
      [0.5, 0.2],
      [0.65, 0.3],
      [0.75, 0.5],
      [0.6, 0.7],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  {
    stars: [
      [0.5, 0.2],
      [0.35, 0.4],
      [0.65, 0.4],
      [0.3, 0.65],
      [0.7, 0.65],
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
    ],
  },
  {
    stars: [
      [0.2, 0.35],
      [0.5, 0.25],
      [0.8, 0.35],
      [0.2, 0.65],
      [0.5, 0.75],
      [0.8, 0.65],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [3, 4],
      [4, 5],
      [0, 3],
      [2, 5],
    ],
  },
  {
    stars: [
      [0.2, 0.2],
      [0.35, 0.35],
      [0.5, 0.3],
      [0.65, 0.4],
      [0.75, 0.55],
      [0.8, 0.7],
      [0.7, 0.8],
      [0.55, 0.75],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
  },
  {
    stars: [
      [0.3, 0.6],
      [0.5, 0.4],
      [0.7, 0.6],
      [0.5, 0.2],
      [0.5, 0.7],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
      [0, 4],
      [2, 4],
    ],
  },
  {
    stars: [
      [0.25, 0.3],
      [0.4, 0.2],
      [0.6, 0.3],
      [0.75, 0.5],
      [0.6, 0.7],
      [0.4, 0.7],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
  },
  {
    stars: [
      [0.2, 0.35],
      [0.4, 0.25],
      [0.6, 0.25],
      [0.8, 0.35],
      [0.2, 0.65],
      [0.4, 0.55],
      [0.6, 0.55],
      [0.8, 0.65],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
  },
  {
    stars: [
      [0.25, 0.3],
      [0.4, 0.5],
      [0.5, 0.2],
      [0.6, 0.5],
      [0.75, 0.3],
      [0.5, 0.75],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [3, 5],
    ],
  },
];

type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;

export class GameScene extends Phaser.Scene implements EnemyHost {
  player!: Player;
  private room!: RoomData;
  private grid!: number[][];
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private blockSprites = new Map<string, Phaser.Physics.Arcade.Sprite>();
  /** bump count per "x,y" key — 2 bumps destroy a Magic block */
  private bumpCounts = new Map<string, number>();
  private enemies!: Phaser.GameObjects.Group;
  private fireballs!: Phaser.GameObjects.Group;
  private shots!: Phaser.GameObjects.Group;
  private flames!: Phaser.GameObjects.Group;
  private itemSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private doorSprite!: Phaser.Physics.Arcade.Sprite;
  private keySprite: Phaser.Physics.Arcade.Sprite | null = null;
  private hasKey = false;
  private doorOpen = false;
  private finishing = false;
  private spawnPoint = { x: 0, y: 0 };
  private hudScore!: Phaser.GameObjects.Text;
  private hudBonus!: Phaser.GameObjects.Text;
  private hudMid!: Phaser.GameObjects.Text;
  private hudFairy!: Phaser.GameObjects.Text;
  private hudLives!: Phaser.GameObjects.Container;
  private facingArrow!: Phaser.GameObjects.Text;
  private lastHudLives = -1;
  private secretTaken = false;
  private coinsLeft = 0;
  private levelStats = { score: 0, items: 0, secrets: 0, enemies: 0 };
  private bonus!: BonusCounter;
  private inv!: Inventory;
  private itemCtx!: ItemCtx;

  // effect emitters
  private emGold!: Emitter;
  private emPurple!: Emitter;
  private emOrange!: Emitter;
  private emRed!: Emitter;
  private emWhite!: Emitter;
  private emCyan!: Emitter;
  private emGreen!: Emitter;

  constructor() {
    super("Game");
  }

  init(data: { levelId?: number; roomId?: number }) {
    // Support both legacy { levelId } from FlowScenes and new { roomId }
    const id = data.roomId ?? data.levelId ?? 1;
    this.room = getRoom(id);
    this.grid = this.room.grid.map((r) => [...r]);
    this.hasKey = false;
    this.doorOpen = false;
    this.finishing = false;
    this.secretTaken = false;
    this.keySprite = null;
    this.blockSprites.clear();
    this.bumpCounts.clear();
    this.itemSprites = [];
    this.levelStats = { score: 0, items: 0, secrets: 0, enemies: 0 };
    resetPad();
  }

  create() {
    const world = this.room.theme;
    const hc = getSettings().highContrast;
    const wallTheme = constellationOfRoom(this.room.id) % 4;

    // Layout: top HUD strip occupies screen y 0..23. The playfield (world
    // y 0..312) is shifted down by HUD_H via camera scroll; HUD elements use
    // scrollFactor(0). The bottom status bar overlays the bottom border row
    // (screen y 312..335).
    this.cameras.main.setScroll(0, -HUD_H);

    this.createBackground(world, hc);
    this.setupParticles();

    // Create BonusCounter and Inventory for this room
    this.bonus = new BonusCounter();
    this.inv = new Inventory();
    this.itemCtx = {
      inv: this.inv,
      bonus: this.bonus,
      score: 0,
      flags: {
        bellRung: false,
        meltona: false,
        wings: false,
        sealHere: false,
        sign: false,
      },
      seals: { solomon: new Set<number>(), constellation: new Set<number>() },
    };

    this.physics.world.setBounds(
      TILE,
      TILE,
      (GRID_W - 2) * TILE,
      (GRID_H - 2) * TILE,
    );
    this.solids = this.physics.add.staticGroup();
    this.enemies = this.add.group();
    this.fireballs = this.add.group();
    this.shots = this.add.group();
    this.flames = this.add.group();

    // Build tiles from room grid.
    // Border cells use the room's wall-theme frame tiles; interior stone uses
    // the warm orange/tan main wall (white variant in grey-brick rooms).
    const wallTex = wallTheme === 2 ? "tile-wall-white" : "tile-wall";
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const t = this.grid[y][x];
        const isBorder =
          x === 0 || x === GRID_W - 1 || y === 0 || y === GRID_H - 1;
        if (t === Tile.Stone) {
          this.solids.create(
            tw(x),
            th(y),
            isBorder ? `border-t${wallTheme}` : wallTex,
          ) as Phaser.Physics.Arcade.Sprite;
        } else if (t === Tile.Magic) {
          this.addMagicBlock(x, y, false);
        }
      }
    }
    this.decorateFrame(wallTheme);

    // Spawn point from room.spawn
    this.spawnPoint = { x: tw(this.room.spawn.x), y: th(this.room.spawn.y) };

    // Door
    this.doorSprite = this.physics.add.staticSprite(
      tw(this.room.door.x),
      th(this.room.door.y),
      "door-closed",
    );

    // Key
    this.keySprite = this.physics.add.staticSprite(
      tw(this.room.key.x),
      th(this.room.key.y),
      "item-key",
    );
    this.tweens.add({
      targets: this.keySprite,
      y: th(this.room.key.y) - 4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
    this.addGlow(this.keySprite, 0xffc83c, 3);

    // Secret tiles
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        if (this.room.grid[y][x] === Tile.Secret) {
          const zone = this.add.zone(tw(x), th(y), TILE, TILE);
          this.physics.add.existing(zone, true);
          this.time.delayedCall(0, () => {
            this.physics.add.overlap(this.player, zone as any, () =>
              this.foundSecret(x, y),
            );
          });
        }
      }
    }

    // Items from room.items
    this.coinsLeft = this.room.items.filter((i) => i.type === "coin").length;
    for (const it of this.room.items) {
      const tex = this.textures.exists(`item-${it.type}`)
        ? `item-${it.type}`
        : "item-coin";
      const spr = this.physics.add.staticSprite(tw(it.x), th(it.y), tex);
      spr.setData("itype", it.type);
      spr.setData("hidden", !!it.hidden);
      if (it.hidden) {
        spr.setVisible(false);
        (spr.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      }
      this.itemSprites.push(spr);
    }

    // Player
    this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y);
    if (this.room.spawn.facing === -1) {
      this.player.facing = -1;
      this.player.setFlipX(true);
    }

    // Enemies — all mapped to existing legacy behavior; Task 9 replaces
    for (const e of this.room.enemies) {
      this.spawnEnemy(e.x, e.y, e.type, null);
    }

    // Portals
    for (let i = 0; i < this.room.portals.length; i++) {
      const p = this.room.portals[i];
      const spr = this.add.sprite(tw(p.x), th(p.y), "portal");
      this.tweens.add({ targets: spr, angle: 360, duration: 3000, repeat: -1 });
      this.addGlow(spr, 0x8c4bd9, 2);
      this.time.addEvent({
        delay: p.cooldown,
        loop: true,
        callback: () => {
          if (this.finishing || !this.player.alive) return;
          const active = this.enemies
            .getChildren()
            .filter(
              (c) => (c as Enemy).fromPortal === `p${i}` && c.active,
            ).length;
          if (active < p.max) {
            const e = this.spawnEnemy(p.x, p.y, p.type, `p${i}`);
            e.setScale(0.2);
            this.tweens.add({ targets: e, scale: 1, duration: 300 });
          }
        },
      });
    }

    // Physics wiring
    this.physics.add.collider(this.player, this.solids, (_pl, tile) => {
      // Head-bump detection: player moving upward, tile above player's head
      this.checkHeadBump(tile as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.collider(
      this.enemies,
      this.solids,
      undefined,
      (e) => (e as Enemy).collidesWithWorld,
    );

    // Instant death on enemy overlap
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
      (s as Phaser.Physics.Arcade.Image).destroy(),
    );
    this.physics.add.overlap(this.player, this.flames, (_p, fl) => {
      if ((fl as Phaser.GameObjects.GameObject).active) this.onPlayerHit();
    });
    this.physics.add.overlap(this.fireballs, this.enemies, (f, e) =>
      this.fireballHit(f as any, e as Enemy),
    );
    this.physics.add.collider(this.fireballs, this.solids, (f) => {
      this.burst((f as any).x, (f as any).y, this.emOrange, 6);
      (f as Phaser.Physics.Arcade.Image).destroy();
    });
    if (this.keySprite) {
      this.physics.add.overlap(this.player, this.keySprite, () =>
        this.pickKey(),
      );
    }
    this.physics.add.overlap(this.player, this.doorSprite, () =>
      this.tryExit(),
    );
    for (const spr of this.itemSprites) {
      this.physics.add.overlap(this.player, spr, () => this.pickItem(spr));
    }

    // HUD — top strip (screen y 0..23) + bottom status bar (screen y 312..335)
    this.createHud();

    this.facingArrow = this.add
      .text(0, 0, ">", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#ffc83c",
      })
      .setOrigin(0.5, 1)
      .setDepth(25);

    // BonusCounter tick every 120ms
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        if (this.finishing || !this.player.alive) return;
        this.bonus.tick();
        if (this.bonus.expired) this.onPlayerHit();
      },
    });

    Audio.setWorld(world);
    Audio.music("world");
    window.dispatchEvent(new CustomEvent("mk-scene", { detail: "Game" }));
  }

  /* ---- frame decorations (Task 10) ---- */

  /** Corner gargoyle statues (theme 0) + twinkling sparkle stars on wall tiles. */
  private decorateFrame(wallTheme: number) {
    if (wallTheme === 0) {
      const corners: [number, number][] = [
        [0, 0],
        [GRID_W - 1, 0],
        [0, GRID_H - 1],
        [GRID_W - 1, GRID_H - 1],
      ];
      for (const [cx, cy] of corners) {
        this.add
          .image(tw(cx), th(cy), "deco-gargoyle")
          .setFlipX(cx > 0)
          .setDepth(5);
      }
    }
    // Sparkle stars at fixed pseudo-random positions on border wall tiles
    const perimeter: [number, number][] = [];
    for (let x = 1; x < GRID_W - 1; x++) {
      perimeter.push([x, 0], [x, GRID_H - 1]);
    }
    for (let y = 1; y < GRID_H - 1; y++) {
      perimeter.push([0, y], [GRID_W - 1, y]);
    }
    const seed = this.room.id * 2654435761;
    for (let i = 0; i < 6; i++) {
      const h = Math.abs((seed ^ (i * 374761393)) % perimeter.length);
      const [gx, gy] = perimeter[h];
      if (this.gridAt(gx, gy) !== Tile.Stone) continue;
      const star = this.add
        .image(tw(gx) + ((i * 7) % 9) - 4, th(gy) + ((i * 5) % 9) - 4, "sparkle")
        .setDepth(6)
        .setAlpha(0.2);
      this.tweens.add({
        targets: star,
        alpha: 0.9,
        duration: 500 + ((i * 137) % 400),
        delay: (i * 230) % 1200,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /* ---- HUD (Task 10) ---- */

  private createHud() {
    const font = { fontFamily: "monospace", fontSize: "10px" };
    const fix = <T extends Phaser.GameObjects.Components.ScrollFactor &
      Phaser.GameObjects.Components.Depth>(o: T, depth = 31): T => {
      o.setScrollFactor(0);
      o.setDepth(depth);
      return o;
    };

    // Top strip: 1P  <score>   BONUS <bonus>
    fix(this.add.rectangle(GAME_W / 2, HUD_H / 2, GAME_W, HUD_H, 0x000000), 30);
    fix(this.add.text(6, 7, "1P", { ...font, color: "#f4f4f4" }));
    this.hudScore = fix(
      this.add.text(30, 7, "000000", { ...font, color: "#ffc83c" }),
    );
    fix(
      this.add
        .text(GAME_W - 50, 7, "BONUS", { ...font, color: "#2ecc71" })
        .setOrigin(1, 0),
    );
    this.hudBonus = fix(
      this.add
        .text(GAME_W - 6, 7, "00000", { ...font, color: "#f4f4f4" })
        .setOrigin(1, 0),
    );

    // Bottom status bar (overlays the bottom border row)
    const barY = GAME_H - HUD_H; // 312
    fix(
      this.add.rectangle(GAME_W / 2, barY + HUD_H / 2, GAME_W, HUD_H, 0x000000),
      30,
    );
    this.hudFairy = fix(
      this.add.text(6, barY + 7, "FAIRY..0", { ...font, color: "#f4f4f4" }),
    );
    this.hudLives = this.add.container(86, barY + 7).setDepth(32);
    this.hudLives.setScrollFactor(0);
    this.hudMid = fix(
      this.add
        .text(GAME_W / 2 + 40, barY + 7, "", { ...font, color: "#ffc83c" })
        .setOrigin(0.5, 0),
    );
    // -DEMO- slot: reserved, hidden unless demo mode is active
    fix(
      this.add
        .text(GAME_W - 6, barY + 7, "-DEMO-", { ...font, color: "#59d9e6" })
        .setOrigin(1, 0),
    ).setVisible(!!this.registry.get("demoMode"));
  }

  /* ---- background ---- */

  private createBackground(world: number, hc: boolean) {
    const playH = GRID_H * TILE;
    const tint = WORLD_TINTS[Math.min(world, WORLD_TINTS.length - 1)];

    this.add.rectangle(
      GAME_W / 2,
      playH / 2,
      GAME_W,
      playH,
      hc ? 0x000000 : 0x12121e,
    );
    if (hc) return;

    const gfx = this.add.graphics();

    gfx.fillStyle(0x0a0a16, 0.55);
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 4; col++) {
        const bx = col * 90 + (row % 2) * 45;
        const by = row * 44;
        gfx.fillRect(bx, by, 88, 42);
      }
    }

    gfx.fillStyle(tint, 0.04);
    gfx.fillRect(0, 0, GAME_W, playH);

    const ci = world % CONSTELLATIONS.length;
    const con = CONSTELLATIONS[ci];
    gfx.lineStyle(1, tint, 0.08);
    for (const [from, to] of con.lines) {
      const [x1, y1] = con.stars[from];
      const [x2, y2] = con.stars[to];
      gfx.lineBetween(x1 * GAME_W, y1 * playH, x2 * GAME_W, y2 * playH);
    }

    for (const [sx, sy] of con.stars) {
      this.add.rectangle(sx * GAME_W, sy * playH, 2, 2, tint).setAlpha(0.3);
    }

    const eyeGlow = (x: number, y: number) => {
      const eye = this.add.rectangle(x, y, 4, 4, tint).setAlpha(0.7);
      this.tweens.add({
        targets: eye,
        alpha: 0.1,
        duration: 900 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
      });
    };
    eyeGlow(TILE / 2, TILE * 1.5);
    eyeGlow(GAME_W - TILE / 2, TILE * 1.5);
    eyeGlow(TILE / 2, TILE * 8);
    eyeGlow(GAME_W - TILE / 2, TILE * 8);
  }

  /* ---- particles ---- */

  private setupParticles() {
    this.emGold = this.add
      .particles(0, 0, "px-gold", {
        speed: { min: 40, max: 110 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 280, max: 480 },
        gravityY: 120,
        emitting: false,
        quantity: 1,
      })
      .setDepth(18);
    this.emPurple = this.add
      .particles(0, 0, "px-purple", {
        speed: { min: 40, max: 110 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 280, max: 480 },
        gravityY: 120,
        emitting: false,
        quantity: 1,
      })
      .setDepth(18);
    this.emOrange = this.add
      .particles(0, 0, "px-orange", {
        speed: { min: 40, max: 110 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 280, max: 480 },
        gravityY: 120,
        emitting: false,
        quantity: 1,
      })
      .setDepth(18);
    this.emRed = this.add
      .particles(0, 0, "px-red", {
        speed: { min: 40, max: 110 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 280, max: 480 },
        gravityY: 120,
        emitting: false,
        quantity: 1,
      })
      .setDepth(18);
    this.emWhite = this.add
      .particles(0, 0, "px-white", {
        speed: { min: 40, max: 110 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 280, max: 480 },
        gravityY: 120,
        emitting: false,
        quantity: 1,
      })
      .setDepth(18);
    this.emCyan = this.add
      .particles(0, 0, "px-cyan", {
        speed: { min: 40, max: 110 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 280, max: 480 },
        gravityY: 120,
        emitting: false,
        quantity: 1,
      })
      .setDepth(18);
    this.emGreen = this.add
      .particles(0, 0, "px-green", {
        speed: { min: 40, max: 110 },
        scale: { start: 1, end: 0 },
        lifespan: { min: 280, max: 480 },
        gravityY: 120,
        emitting: false,
        quantity: 1,
      })
      .setDepth(18);
  }

  private burst(x: number, y: number, emitter: Emitter, count: number) {
    emitter.explode(count, x, y);
  }

  private floatScore(x: number, y: number, pts: number) {
    if (pts <= 0) return;
    const t = this.add
      .text(x, y, `+${pts}`, {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#ffc83c",
      })
      .setOrigin(0.5, 1)
      .setDepth(50);
    this.tweens.add({
      targets: t,
      y: y - 22,
      alpha: 0,
      duration: 900,
      ease: "Cubic.Out",
      onComplete: () => t.destroy(),
    });
  }

  /* ---- PostFX glow (WebGL only) ---- */

  private addGlow(
    obj: Phaser.GameObjects.GameObject,
    color: number,
    strength = 2,
  ) {
    try {
      const go = obj as any;
      if (go.preFX) {
        const fx = go.preFX.addGlow(color, strength, 0, false, 0.1, 12);
        this.tweens.add({
          targets: fx,
          outerStrength: strength * 2,
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      }
    } catch {
      // canvas renderer: ignore
    }
  }

  /* ---- helpers ---- */

  private addMagicBlock(x: number, y: number, animated: boolean) {
    const s = this.solids.create(
      tw(x),
      th(y),
      "tile-magic",
    ) as Phaser.Physics.Arcade.Sprite;
    s.setData("magic", true);
    s.setData("gx", x);
    s.setData("gy", y);
    this.grid[y][x] = Tile.Magic;
    this.blockSprites.set(`${x},${y}`, s);
    if (animated) {
      s.setScale(0.2);
      this.burst(tw(x), th(y), this.emPurple, 8);
      this.tweens.add({
        targets: s,
        scale: 1,
        duration: 120,
        onComplete: () => s.refreshBody(),
      });
    }
    return s;
  }

  private destroyMagicBlock(x: number, y: number) {
    const spr = this.blockSprites.get(`${x},${y}`);
    this.grid[y][x] = Tile.Empty;
    this.blockSprites.delete(`${x},${y}`);
    this.bumpCounts.delete(`${x},${y}`);
    if (spr) {
      this.burst(spr.x, spr.y, this.emPurple, 10);
      this.burst(spr.x, spr.y, this.emWhite, 4);
      this.tweens.add({
        targets: spr,
        scale: 0,
        alpha: 0,
        duration: 130,
        onComplete: () => spr.destroy(),
      });
      (spr.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    }
    // Reveal hidden item at this position if any
    const hiddenItem = this.room.hidden.find((h) => h.x === x && h.y === y);
    if (hiddenItem) {
      const tex = this.textures.exists(`item-${hiddenItem.type}`)
        ? `item-${hiddenItem.type}`
        : "item-coin";
      const hSpr = this.physics.add.staticSprite(tw(x), th(y), tex);
      hSpr.setData("itype", hiddenItem.type);
      hSpr.setData("hidden", false);
      this.itemSprites.push(hSpr);
      this.physics.add.overlap(this.player, hSpr, () => this.pickItem(hSpr));
      this.burst(tw(x), th(y), this.emGold, 8);
      Audio.sfx("secret");
    }
    Audio.sfx("break");
    this.player.showCast();
  }

  private checkHeadBump(tile: Phaser.Physics.Arcade.Sprite) {
    if (!tile || !tile.getData("magic")) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    // Only count bump if player is moving upward and the collision is from above (player's top hit tile)
    if (body.velocity.y >= 0) return;
    if (!body.blocked.up) return;
    const gx: number = tile.getData("gx");
    const gy: number = tile.getData("gy");
    const key = `${gx},${gy}`;
    const count = (this.bumpCounts.get(key) ?? 0) + 1;
    if (count >= 2) {
      this.destroyMagicBlock(gx, gy);
      this.cameras.main.shake(50, 0.004);
    } else {
      this.bumpCounts.set(key, count);
      // Visual feedback: slight shake of the block
      if (tile.active) {
        this.tweens.add({
          targets: tile,
          y: tile.y - 3,
          duration: 40,
          yoyo: true,
        });
      }
    }
  }

  private spawnEnemy(
    gx: number,
    gy: number,
    type: import("@/types").EnemyType,
    portal: string | null,
  ) {
    const e = new Enemy(this, tw(gx), th(gy), type);
    e.fromPortal = portal;
    this.enemies.add(e);
    return e;
  }

  fireEnemyShot(x: number, y: number, txx: number, tyy: number) {
    const s = this.physics.add.image(x, y, "shot");
    (s.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    const dx = txx - x;
    const dy = tyy - y;
    const len = Math.max(1, Math.hypot(dx, dy));
    s.setVelocity((dx / len) * 110, (dy / len) * 110);
    this.shots.add(s);
    this.time.delayedCall(4000, () => s.active && s.destroy());
  }

  /** wizard: slow bolt that homes toward the player (steered in update()) */
  castHomingBolt(x: number, y: number) {
    const s = this.physics.add.image(x, y, "shot");
    (s.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    s.setTint(0x8c4bd9);
    s.setData("homing", true);
    const dx = this.player.x - x;
    const dy = this.player.y - y;
    const len = Math.max(1, Math.hypot(dx, dy));
    s.setVelocity((dx / len) * 55, (dy / len) * 55);
    this.shots.add(s);
    this.burst(x, y, this.emPurple, 6);
    this.time.delayedCall(6000, () => s.active && s.destroy());
  }

  /** saramandor: deadly 1.5-tile flame in front of the enemy for ~1s */
  breatheFlame(x: number, y: number, dir: 1 | -1) {
    const fl = this.physics.add.image(x + dir * TILE * 1.1, y + 2, "fireball");
    (fl.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    fl.setFlipX(dir < 0);
    fl.setDisplaySize(TILE * 1.5, 12);
    (fl.body as Phaser.Physics.Arcade.Body).setSize(TILE * 1.5, 10);
    fl.setDepth(16);
    this.flames.add(fl);
    this.burst(fl.x, fl.y, this.emOrange, 8);
    Audio.sfx("fireball");
    this.tweens.add({
      targets: fl,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      repeat: 4,
    });
    this.time.delayedCall(1000, () => fl.active && fl.destroy());
  }

  /** true if the grid cell is solid (stone or magic block) */
  solidAt(gx: number, gy: number): boolean {
    const t = this.gridAt(gx, gy);
    return t === Tile.Stone || t === Tile.Magic;
  }

  /** random empty cell with solid ground beneath it (for wizard teleport) */
  randomStandableCell(): { x: number; y: number } | null {
    for (let tries = 0; tries < 30; tries++) {
      const gx = Phaser.Math.Between(1, GRID_W - 2);
      const gy = Phaser.Math.Between(1, GRID_H - 3);
      if (
        this.gridAt(gx, gy) === Tile.Empty &&
        this.solidAt(gx, gy + 1) &&
        this.cellFree(gx, gy)
      ) {
        return { x: gx, y: gy };
      }
    }
    return null;
  }

  private spark(x: number, y: number) {
    this.burst(x, y, this.emGold, 5);
    this.burst(x, y, this.emWhite, 3);
    for (let i = 0; i < 3; i++) {
      const p = this.add.image(x, y, "spark").setDepth(17);
      this.tweens.add({
        targets: p,
        x: x + (Math.random() - 0.5) * 22,
        y: y + (Math.random() - 0.5) * 22,
        alpha: 0,
        duration: 220,
        onComplete: () => p.destroy(),
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
      y: Math.floor(this.player.y / TILE),
    };
  }

  private itemAtCell(
    gx: number,
    gy: number,
  ): Phaser.Physics.Arcade.Sprite | null {
    const rect = new Phaser.Geom.Rectangle(gx * TILE, gy * TILE, TILE, TILE);
    return (
      this.itemSprites.find(
        (it) =>
          it.active &&
          it.visible &&
          Phaser.Geom.Rectangle.Overlaps(rect, it.getBounds()),
      ) ?? null
    );
  }

  private cellFree(gx: number, gy: number): boolean {
    if (this.gridAt(gx, gy) !== Tile.Empty) return false;
    const rect = new Phaser.Geom.Rectangle(gx * TILE, gy * TILE, TILE, TILE);
    for (const e of this.enemies.getChildren() as Enemy[]) {
      if (e.active && Phaser.Geom.Rectangle.Overlaps(rect, e.getBounds()))
        return false;
    }
    if (Phaser.Geom.Rectangle.Overlaps(rect, this.player.getBounds()))
      return false;
    for (const it of this.itemSprites) {
      if (it.active && Phaser.Geom.Rectangle.Overlaps(rect, it.getBounds()))
        return false;
    }
    if (Phaser.Geom.Rectangle.Overlaps(rect, this.doorSprite.getBounds()))
      return false;
    if (
      this.keySprite?.active &&
      Phaser.Geom.Rectangle.Overlaps(rect, this.keySprite.getBounds())
    )
      return false;
    return true;
  }

  private tryCreateBlock() {
    const c = this.playerCell();
    const f = this.player.facing;
    // Diagonal target: diagonally up-front when holding Up
    const diag = pad.up;
    const targets = diag
      ? [
          { x: c.x + f, y: c.y - 1 }, // diagonal up-front
          { x: c.x + f, y: c.y },
        ]
      : [
          { x: c.x + f, y: c.y },
          { x: c.x + f, y: c.y + 1 },
          { x: c.x + f, y: c.y - 1 },
          { x: c.x, y: c.y - 1 },
        ];
    for (const t of targets) {
      if (t.x <= 0 || t.x >= GRID_W - 1 || t.y <= 0 || t.y >= GRID_H - 1)
        continue;
      // Diamond rule: casting block magic on a diamond turns it into a jar of the same color
      const occupant = this.itemAtCell(t.x, t.y);
      if (occupant) {
        const itype = occupant.getData("itype") as ItemType;
        if (itype === "diamondBlue" || itype === "diamondOrange") {
          const jar: ItemType =
            itype === "diamondBlue" ? "jarBlue" : "jarOrange";
          occupant.setData("itype", jar);
          occupant.setTexture(
            this.textures.exists(`item-${jar}`) ? `item-${jar}` : "item-coin",
          );
          this.burst(occupant.x, occupant.y, this.emPurple, 8);
          this.burst(occupant.x, occupant.y, this.emCyan, 5);
          Audio.sfx("create");
          this.player.showCast();
          return;
        }
      }
      if (this.cellFree(t.x, t.y)) {
        this.addMagicBlock(t.x, t.y, true);
        Audio.sfx("create");
        this.player.showCast();
        return;
      }
    }
    this.cameras.main.shake(60, 0.002);
  }

  private tryDestroyBlock() {
    const c = this.playerCell();
    const f = this.player.facing;
    const diag = pad.up;
    const targets = diag
      ? [
          { x: c.x + f, y: c.y - 1 }, // diagonal up-front
          { x: c.x + f, y: c.y },
        ]
      : [
          { x: c.x + f, y: c.y },
          { x: c.x + f, y: c.y + 1 },
          { x: c.x + f, y: c.y - 1 },
          { x: c.x, y: c.y - 1 },
        ];
    for (const t of targets) {
      if (this.gridAt(t.x, t.y) === Tile.Magic) {
        this.destroyMagicBlock(t.x, t.y);
        return;
      }
    }
    this.cameras.main.shake(60, 0.002);
  }

  private shootFireball() {
    const kind = this.inv.shoot();
    if (kind === null) return; // no fireballs in inventory
    const isSuper = kind === "super";
    const rangePx = isSuper ? GAME_W * 2 : this.inv.rangeTiles * TILE;
    const f = this.physics.add.image(
      this.player.x + this.player.facing * 10,
      this.player.y,
      "fireball",
    );
    (f.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    f.setVelocityX(this.player.facing * FIREBALL_SPEED);
    f.setData("startX", f.x);
    f.setData("range", rangePx);
    f.setData("power", isSuper ? 2 : 1);
    f.setData("super", isSuper);

    const trail = this.add
      .particles(0, 0, isSuper ? "px-gold" : "px-orange", {
        speed: { min: 10, max: 35 },
        scale: { start: 0.8, end: 0 },
        lifespan: 180,
        quantity: 2,
        follow: f,
      })
      .setDepth(15);
    f.setData("trail", trail);

    this.fireballs.add(f);
    Audio.sfx("fireball");
    this.player.showCast();
  }

  private fireballHit(f: Phaser.Physics.Arcade.Image, e: Enemy) {
    if (!f.active || !e.active) return;
    const power = (f.getData("power") as number) ?? 1;
    const isSuper = f.getData("super") as boolean;
    const trail = f.getData("trail") as Emitter | null;
    // Super fireball pierces — don't destroy the fireball
    if (!isSuper) {
      if (trail) {
        trail.stop();
        this.time.delayedCall(300, () => trail.destroy());
      }
      f.destroy();
    }
    // ghosts are immune to normal fireballs — only super kills them
    if (e.fireballImmune && !isSuper) {
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
      this.registry.inc("enemiesDefeated", 1);
      Audio.sfx("break");
    } else {
      e.setTintFill(0xffffff);
      this.time.delayedCall(60, () => e.clearTint());
      this.cameras.main.shake(50, 0.003);
    }
  }

  private enemyEmitter(etype: string): Emitter {
    switch (etype) {
      case "goblin":
        return this.emGreen;
      case "saramandor":
        return this.emOrange;
      case "demonhead":
        return this.emRed;
      case "ghost":
        return this.emCyan;
      case "gargoyle":
        return this.emGreen;
      case "wizard":
        return this.emPurple;
      default:
        return this.emRed;
    }
  }

  private addScore(n: number) {
    this.levelStats.score += n;
    this.registry.inc("runScore", n);
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
    Audio.sfx("key");
    this.openDoor();
  }

  private openDoor() {
    if (this.doorOpen) return;
    this.doorOpen = true;
    this.doorSprite.setTexture("door-open");
    this.burst(this.doorSprite.x, this.doorSprite.y, this.emGold, 12);
    this.addGlow(this.doorSprite, 0xffe89a, 3);
    Audio.sfx("door");
  }

  private pickItem(spr: Phaser.Physics.Arcade.Sprite) {
    if (!spr.active || !spr.visible) return;
    const type = spr.getData("itype") as ItemType;
    const ix = spr.x;
    const iy = spr.y;
    spr.destroy();
    this.levelStats.items++;
    this.registry.inc("itemsCollected", 1);

    // Pure effect dispatch (inventory, bonus counter, flags, seals, points)
    const sealIndex =
      type === "sealSolomon" ? this.room.id : constellationOfRoom(this.room.id);
    const pts = applyItem(type, this.itemCtx, sealIndex);
    if (pts > 0) {
      this.addScore(pts);
      this.floatScore(ix, iy, pts);
    }

    // Scene-level effects + visuals
    switch (type) {
      case "coin":
        this.burst(ix, iy, this.emGold, 7);
        Audio.sfx("coin");
        this.coinsLeft--;
        if (this.coinsLeft === 0) this.revealHiddenItems();
        break;
      case "gem":
      case "jewel":
      case "diamondBlue":
      case "diamondOrange":
        this.burst(ix, iy, this.emCyan, 8);
        this.burst(ix, iy, this.emGreen, 4);
        Audio.sfx("gem");
        break;
      case "chest":
        this.burst(ix, iy, this.emGold, 14);
        this.burst(ix, iy, this.emOrange, 6);
        this.addScore(POINTS.chest);
        this.floatScore(ix, iy, POINTS.chest);
        Audio.sfx("chest");
        break;
      case "life":
        this.burst(ix, iy, this.emRed, 10);
        this.registry.inc("lives", 1);
        Audio.sfx("secret");
        break;
      case "time":
      case "hourglass":
      case "hourglassBlue":
      case "medEdlem":
      case "potionX2":
      case "potionX5":
        this.burst(ix, iy, this.emWhite, 8);
        Audio.sfx("chest");
        break;
      case "medMeltona":
        this.burst(ix, iy, this.emPurple, 10);
        Audio.sfx("secret");
        this.meltEnemies();
        break;
      case "signConstellation":
        this.burst(ix, iy, this.emPurple, 10);
        Audio.sfx("secret");
        break;
      case "fire":
      case "jarBlue":
      case "jarOrange":
      case "jarUpgrade":
        this.burst(ix, iy, this.emOrange, 12);
        this.burst(ix, iy, this.emGold, 6);
        Audio.sfx("secret");
        break;
      case "crystalBlue":
      case "crystalOrange":
        this.burst(ix, iy, this.emCyan, 8);
        Audio.sfx("gem");
        break;
      case "fairy":
        this.burst(ix, iy, this.emWhite, 10);
        Audio.sfx("secret");
        break;
      case "bell":
        this.burst(ix, iy, this.emGold, 10);
        Audio.sfx("secret");
        this.releaseFairy();
        break;
      case "wings":
        this.burst(ix, iy, this.emWhite, 14);
        Audio.sfx("secret");
        this.exitWithWings();
        break;
      case "key":
        this.burst(ix, iy, this.emGold, 12);
        Audio.sfx("key");
        this.hasKey = true;
        this.openDoor();
        break;
      case "pageTime":
        this.burst(ix, iy, this.emGold, 16);
        SaveSystem.update((s) => {
          s.pages.time = true;
        });
        Audio.sfx("secret");
        break;
      case "pageSpace":
        this.burst(ix, iy, this.emGold, 16);
        SaveSystem.update((s) => {
          s.pages.space = true;
        });
        Audio.sfx("secret");
        break;
      case "princess":
        this.burst(ix, iy, this.emGold, 20);
        SaveSystem.update((s) => {
          s.princessUnlocked = true;
        });
        Audio.sfx("secret");
        break;
      case "seal":
      case "sealSolomon":
      case "sealConstellation":
        this.burst(ix, iy, this.emPurple, 12);
        this.collectSeal(type);
        break;
      case "crown":
        this.burst(ix, iy, this.emGold, 20);
        this.addScore(POINTS.crown);
        this.floatScore(ix, iy, POINTS.crown);
        SaveSystem.update((s) => {
          if (!s.crowns.includes(this.room.id)) s.crowns.push(this.room.id);
        });
        Audio.sfx("secret");
        break;
      case "orb":
        this.burst(ix, iy, this.emCyan, 16);
        this.addScore(POINTS.orb);
        this.floatScore(ix, iy, POINTS.orb);
        SaveSystem.update((s) => {
          if (!s.orbs.includes(this.room.id)) s.orbs.push(this.room.id);
        });
        Audio.sfx("secret");
        break;
      default:
        // unscored until item system task
        this.burst(ix, iy, this.emGold, 5);
        break;
    }
  }

  /** medMeltona: kills all active saramandors and demonheads on screen */
  private meltEnemies() {
    for (const e of this.enemies.getChildren() as Enemy[]) {
      if (!e.active) continue;
      if (e.etype !== "saramandor" && e.etype !== "demonhead") continue;
      this.burst(e.x, e.y, this.enemyEmitter(e.etype), 12);
      this.burst(e.x, e.y, this.emOrange, 5);
      e.destroy();
      this.addScore(POINTS.enemy);
      this.levelStats.enemies++;
      this.registry.inc("enemiesDefeated", 1);
    }
    this.cameras.main.flash(200, 140, 75, 217, true);
  }

  /** Bell pickup: a fairy emerges from the door and drifts slowly around the room. */
  private releaseFairy() {
    const tex = this.textures.exists("item-fairy") ? "item-fairy" : "item-coin";
    const fairy = this.physics.add.sprite(
      this.doorSprite.x,
      this.doorSprite.y,
      tex,
    );
    (fairy.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    fairy.setDepth(20);
    this.addGlow(fairy, 0xffffff, 2);
    const drift = () => {
      if (!fairy.active) return;
      this.tweens.add({
        targets: fairy,
        x: Phaser.Math.Between(TILE * 2, GAME_W - TILE * 2),
        y: Phaser.Math.Between(TILE * 2, (GRID_H - 3) * TILE),
        duration: Phaser.Math.Between(1800, 2600),
        ease: "Sine.InOut",
        onComplete: drift,
      });
    };
    drift();
    this.physics.add.overlap(this.player, fairy, () => {
      if (!fairy.active) return;
      const fx = fairy.x;
      const fy = fairy.y;
      fairy.destroy();
      const pts = applyItem("fairy", this.itemCtx, 0); // inv.addFairy + points
      this.addScore(pts);
      this.floatScore(fx, fy, pts);
      this.burst(fx, fy, this.emWhite, 12);
      Audio.sfx("secret");
    });
  }

  /** Wings pickup: leave the room immediately and skip ahead. */
  private exitWithWings() {
    if (this.finishing) return;
    this.finishing = true;
    SaveSystem.update((s) => {
      s.wingsSkipsUsed += 1;
    });
    this.cameras.main.flash(300, 200, 220, 255, true);
    this.tweens.add({
      targets: this.player,
      y: -TILE,
      alpha: 0,
      duration: 600,
      ease: "Sine.In",
    });
    this.time.delayedCall(700, () => {
      Audio.stopMusic();
      this.scene.start("Game", { roomId: wingsTarget(this.room.id) });
    });
  }

  private revealHiddenItems() {
    for (const spr of this.itemSprites) {
      if (spr.active && spr.getData("hidden")) {
        spr.setVisible(true);
        (spr.body as Phaser.Physics.Arcade.StaticBody).enable = true;
        this.burst(spr.x, spr.y, this.emGold, 8);
      }
    }
    this.cameras.main.flash(200, 255, 200, 60, true);
    Audio.sfx("secret");
  }

  private foundSecret(gx: number, gy: number) {
    if (this.secretTaken) return;
    this.secretTaken = true;
    const spr = this.physics.add.staticSprite(tw(gx), th(gy), "item-seal");
    spr.setData("itype", "seal");
    this.itemSprites.push(spr);
    this.physics.add.overlap(this.player, spr, () => this.pickItem(spr));
    this.burst(tw(gx), th(gy), this.emPurple, 20);
    this.burst(tw(gx), th(gy), this.emGold, 10);
    this.cameras.main.flash(250, 140, 75, 217, true);
    Audio.sfx("secret");
  }

  private collectSeal(type: ItemType) {
    this.levelStats.secrets++;
    const constellation = constellationOfRoom(this.room.id);
    SaveSystem.update((s) => {
      if (type === "sealSolomon") {
        if (!s.solomonSeals.includes(this.room.id))
          s.solomonSeals.push(this.room.id);
      } else if (!s.constellationSeals.includes(constellation)) {
        s.constellationSeals.push(constellation);
      }
      s.secretsFound += 1;
      if (s.constellationSeals.length >= 6) s.pages.time = true;
      if (s.constellationSeals.length >= 12) {
        s.pages.space = true;
        s.princessUnlocked = true;
      }
    });
    this.scene.launch("SecretFound", {
      text: "SEAL OF " + this.room.name.split(" ")[0].toUpperCase(),
    });
  }

  private tryExit() {
    if (this.finishing || !this.doorOpen || !this.hasKey || !this.player.alive)
      return;
    this.finishing = true;
    Audio.music("victory");
    const bonusLeft = this.bonus.value;
    const timeBonus = bonusLeft; // remaining bonus counter is awarded as end-of-room bonus
    this.addScore(timeBonus);
    const stats = {
      ...this.levelStats,
      timeLeft: Math.floor(bonusLeft / 1000),
      timeBonus,
    };
    const next = nextRoom(this.room.id, {
      seals: SaveSystem.current().constellationSeals.length,
      sign: this.itemCtx.flags.sign,
      sealHere: this.itemCtx.flags.sealHere,
    });
    SaveSystem.update((s) => {
      if (!s.completedStages.includes(this.room.id))
        s.completedStages.push(this.room.id);
      if (this.room.id < 48)
        s.unlockedStage = Math.max(s.unlockedStage, this.room.id + 1);
      if (this.room.id === 48) s.unlockedStage = 49;
      s.totalScore += stats.score;
      s.itemsCollected += stats.items;
    });
    this.cameras.main.flash(300, 255, 232, 100, true);
    this.tweens.add({
      targets: this.player,
      alpha: 0,
      scale: 0.3,
      duration: 500,
    });
    this.time.delayedCall(800, () => {
      Audio.stopMusic();
      if (this.room.id === FINAL_STAGE_ID) {
        this.scene.start("Credits", { victory: true });
      } else {
        this.scene.start("LevelComplete", {
          levelId: this.room.id,
          stats,
          nextId: next,
        });
      }
    });
  }

  private onPlayerHit() {
    if (!this.player.alive || this.finishing) return;
    this.cameras.main.shake(120, 0.007);
    this.cameras.main.flash(80, 230, 59, 59, true);
    this.killPlayer();
  }

  private killPlayer() {
    if (!this.player.alive) return;
    this.player.die();
    this.inv.onDeath(); // reset range
    this.burst(this.player.x, this.player.y, this.emRed, 14);
    this.burst(this.player.x, this.player.y, this.emOrange, 8);
    this.cameras.main.shake(200, 0.012);
    this.cameras.main.flash(200, 230, 59, 59, true);
    this.registry.inc("lives", -1);
    const lives = this.registry.get("lives") as number;
    this.time.delayedCall(1400, () => {
      if (lives > 0) {
        this.scene.restart({ levelId: this.room.id });
      } else {
        Audio.stopMusic();
        this.scene.start("GameOver", { levelId: this.room.id });
      }
    });
  }

  update() {
    if (this.finishing) return;
    this.player.update();

    if (this.player.alive) {
      if (justPressed("create")) this.tryCreateBlock();
      if (justPressed("destroy")) this.tryDestroyBlock();
      if (justPressed("fire")) this.shootFireball();
    }
    if (justPressed("pause")) {
      Audio.sfx("pause");
      this.scene.launch("Pause", { levelId: this.room.id });
      this.scene.pause();
    }

    // Homing bolts steer toward the player
    if (this.player.alive) {
      for (const s of this.shots.getChildren() as Phaser.Physics.Arcade.Image[]) {
        if (!s.active || !s.getData("homing")) continue;
        const dx = this.player.x - s.x;
        const dy = this.player.y - s.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const body = s.body as Phaser.Physics.Arcade.Body;
        body.velocity.x = Phaser.Math.Linear(
          body.velocity.x,
          (dx / len) * 55,
          0.04,
        );
        body.velocity.y = Phaser.Math.Linear(
          body.velocity.y,
          (dy / len) * 55,
          0.04,
        );
      }
    }

    // Fireball range limit (super fireballs have unlimited range — large range value)
    for (const f of this.fireballs.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (!f.active) continue;
      if (
        Math.abs(f.x - (f.getData("startX") as number)) >
        (f.getData("range") as number)
      ) {
        this.burst(f.x, f.y, this.emOrange, 4);
        const trail = f.getData("trail") as Emitter | null;
        if (trail) {
          trail.stop();
          this.time.delayedCall(300, () => trail.destroy());
        }
        f.destroy();
      }
    }

    // HUD update
    const lives = (this.registry.get("lives") as number) ?? 3;
    const score = (this.registry.get("runScore") as number) ?? 0;
    const jars = this.inv.fireballs.length;
    const jarStr = jars > 0 ? ` J:${jars}` : "";

    // Top strip: score + bonus counter
    this.hudScore.setText(String(score).padStart(6, "0"));
    this.hudBonus.setText(String(Math.max(0, this.bonus.value)).padStart(5, "0"));
    if (this.bonus.value <= 5000)
      this.hudBonus.setColor(this.bonus.value % 2 ? "#e23b3b" : "#ffc83c");
    else this.hudBonus.setColor("#f4f4f4");

    // Bottom bar: fairy count, room title + KEY/jars, life icons
    this.hudFairy.setText(`FAIRY..${this.inv.fairies}`);
    this.hudMid.setText(
      `${roomTitle(this.room.id)}${this.hasKey ? " [KEY]" : ""}${jarStr}`,
    );

    // Life hearts
    if (lives !== this.lastHudLives) {
      this.lastHudLives = lives;
      this.hudLives.removeAll(true);
      for (let i = 0; i < Math.max(0, lives); i++) {
        const hrt = this.add.image(i * 13, 6, "hud-heart").setOrigin(0, 0.5);
        this.hudLives.add(hrt);
      }
    }

    // Facing arrow
    if (this.player.alive) {
      this.facingArrow.setText(this.player.facing > 0 ? ">" : "<");
      this.facingArrow.setX(this.player.x + this.player.facing * 6);
      this.facingArrow.setY(this.player.y - 10);
      this.facingArrow.setAlpha(1);
    } else {
      this.facingArrow.setAlpha(0);
    }
  }
}
