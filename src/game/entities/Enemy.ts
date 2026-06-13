import * as Phaser from 'phaser';
import type { EnemyType } from '@/types';
import { TILE, GAME_W } from '../constants';

export interface EnemyHost extends Phaser.Scene {
  player: Phaser.Physics.Arcade.Sprite & { alive: boolean };
  /** straight horizontal/aimed projectile */
  fireEnemyShot(x: number, y: number, tx: number, ty: number): void;
  /** slow bolt that homes toward the player */
  castHomingBolt(x: number, y: number): void;
  /** deadly flame hitbox in front of a saramandor, lasts ~1s */
  breatheFlame(x: number, y: number, dir: 1 | -1): void;
  /** true if the grid cell is solid (stone or magic block) */
  solidAt(gx: number, gy: number): boolean;
  /** random empty cell with solid ground under it, or null */
  randomStandableCell(): { x: number; y: number } | null;
}

interface Stats {
  hp: number;
  speed: number;
  gravity: boolean;
  collides: boolean;
}

const STATS: Record<EnemyType, Stats> = {
  goblin:     { hp: 1, speed: 28, gravity: true,  collides: true },
  saramandor: { hp: 2, speed: 24, gravity: true,  collides: true },
  demonhead:  { hp: 1, speed: 38, gravity: false, collides: true },
  ghost:      { hp: 1, speed: 22, gravity: false, collides: false },
  gargoyle:   { hp: 1, speed: 0,  gravity: true,  collides: true },
  wizard:     { hp: 1, speed: 0,  gravity: false, collides: false }
};

const FLAME_DURATION = 1000;
const FLAME_COOLDOWN = 2600;
const GARGOYLE_SHOT_INTERVAL = 3000;
const WIZARD_TELEPORT_INTERVAL = 4000;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  etype: EnemyType;
  hp: number;
  /** ghosts can only be killed by super fireballs */
  fireballImmune = false;
  private dir: 1 | -1 = 1;
  private nextAction = 0;
  /** saramandor: time until the current flame breath ends (0 = not breathing) */
  private flameUntil = 0;
  private host: EnemyHost;
  fromPortal: string | null = null;

  constructor(scene: EnemyHost, x: number, y: number, type: EnemyType) {
    super(scene, x, y, `${type}-0`);
    this.host = scene;
    this.etype = type;
    this.hp = STATS[type].hp;
    this.fireballImmune = type === 'ghost';
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 12).setOffset(2, 2);
    if (!STATS[type].gravity) body.setAllowGravity(false);
    if (type === 'ghost') this.setAlpha(0.7);
    if (type === 'gargoyle') body.setImmovable(true);
    this.play(`${type}-anim`);
    this.dir = Math.random() < 0.5 ? 1 : -1;
    this.setFlipX(this.dir < 0);
    this.nextAction = scene.time.now + 1500 + Math.random() * 1500;
  }

  get collidesWithWorld() {
    return STATS[this.etype].collides;
  }

  damage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }

  /** grid cell of this enemy */
  private cell() {
    return { x: Math.floor(this.x / TILE), y: Math.floor(this.y / TILE) };
  }

  /** true if there is ground just beyond the enemy in walking direction */
  private groundAhead(): boolean {
    const c = this.cell();
    return this.host.solidAt(c.x + this.dir, c.y + 1);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const p = this.host.player;
    const s = STATS[this.etype];

    switch (this.etype) {
      case 'goblin': {
        // walks platforms, turns at walls and ledge edges
        if (body.blocked.left) this.dir = 1;
        else if (body.blocked.right) this.dir = -1;
        else if (body.blocked.down && !this.groundAhead()) this.dir = -this.dir as 1 | -1;
        body.setVelocityX(s.speed * this.dir);
        this.setFlipX(this.dir < 0);
        break;
      }
      case 'saramandor': {
        // breathing flame: stand still
        if (this.flameUntil > 0) {
          body.setVelocityX(0);
          if (time > this.flameUntil) {
            this.flameUntil = 0;
            this.nextAction = time + FLAME_COOLDOWN;
          }
          break;
        }
        if (body.blocked.left) this.dir = 1;
        else if (body.blocked.right) this.dir = -1;
        // walks off drops; while falling, drift toward Dana
        if (!body.blocked.down && p.alive) {
          this.dir = p.x >= this.x ? 1 : -1;
        }
        // Dana within 4 tiles ahead in facing direction at similar height?
        if (p.alive && body.blocked.down) {
          const dx = p.x - this.x;
          const ahead = Math.sign(dx) === this.dir;
          if (ahead && Math.abs(dx) <= 4 * TILE && Math.abs(p.y - this.y) < TILE && time > this.nextAction) {
            this.flameUntil = time + FLAME_DURATION;
            body.setVelocityX(0);
            this.host.breatheFlame(this.x, this.y, this.dir);
            break;
          }
        }
        body.setVelocityX(s.speed * this.dir);
        this.setFlipX(this.dir < 0);
        break;
      }
      case 'demonhead': {
        // flies horizontally straight, turns at walls
        if (body.blocked.left) this.dir = 1;
        else if (body.blocked.right) this.dir = -1;
        body.setVelocity(s.speed * this.dir, 0);
        this.setFlipX(this.dir < 0);
        break;
      }
      case 'ghost': {
        // flies straight through magic blocks; only border walls turn it
        if (this.x <= TILE * 1.5) this.dir = 1;
        else if (this.x >= GAME_W - TILE * 1.5) this.dir = -1;
        body.setVelocity(s.speed * this.dir, 0);
        this.setFlipX(this.dir < 0);
        this.setAlpha(0.45 + 0.3 * Math.abs(Math.sin(time / 400)));
        break;
      }
      case 'gargoyle': {
        // static statue, fires a horizontal shot every 3s in facing direction
        body.setVelocityX(0);
        this.setFlipX(this.dir < 0);
        if (p.alive && time > this.nextAction) {
          this.nextAction = time + GARGOYLE_SHOT_INTERVAL;
          this.host.fireEnemyShot(this.x, this.y, this.x + this.dir * 100, this.y);
        }
        break;
      }
      case 'wizard': {
        // hovers; every 4s teleports to a random standable cell and casts a homing bolt
        body.setVelocity(0, Math.sin(time / 300) * 8);
        if (p.alive) this.setFlipX(p.x < this.x);
        if (p.alive && time > this.nextAction) {
          this.nextAction = time + WIZARD_TELEPORT_INTERVAL;
          const cell = this.host.randomStandableCell();
          if (cell) {
            this.setPosition(cell.x * TILE + TILE / 2, cell.y * TILE + TILE / 2);
            body.reset(this.x, this.y);
            body.setAllowGravity(false);
          }
          this.host.castHomingBolt(this.x, this.y);
        }
        break;
      }
    }
  }
}
