import Phaser from 'phaser';
import type { EnemyType } from '@/types';

export interface EnemyHost extends Phaser.Scene {
  player: Phaser.Physics.Arcade.Sprite & { alive: boolean };
  fireEnemyShot(x: number, y: number, tx: number, ty: number): void;
}

const STATS: Record<EnemyType, { hp: number; speed: number; gravity: boolean; collides: boolean }> = {
  imp: { hp: 1, speed: 28, gravity: true, collides: true },
  bat: { hp: 1, speed: 38, gravity: false, collides: false },
  skull: { hp: 2, speed: 0, gravity: false, collides: false },
  phantom: { hp: 1, speed: 22, gravity: false, collides: false },
  gargoyle: { hp: 4, speed: 18, gravity: true, collides: true }
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  etype: EnemyType;
  hp: number;
  fireballImmune = false;
  private dir: 1 | -1 = 1;
  private nextShot = 0;
  private host: EnemyHost;
  fromPortal: string | null = null;

  constructor(scene: EnemyHost, x: number, y: number, type: EnemyType) {
    super(scene, x, y, `${type}-0`);
    this.host = scene;
    this.etype = type;
    this.hp = STATS[type].hp;
    this.fireballImmune = type === 'phantom' ? false : false; // fireballs destroy most enemies
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 12).setOffset(2, 2);
    if (!STATS[type].gravity) body.setAllowGravity(false);
    if (type === 'phantom') this.setAlpha(0.7);
    this.play(`${type}-anim`);
    this.dir = Math.random() < 0.5 ? 1 : -1;
    this.nextShot = scene.time.now + 1500 + Math.random() * 1500;
  }

  get collidesWithWorld() {
    return STATS[this.etype].collides || this.etype === 'bat';
  }

  damage(amount: number): boolean {
    this.hp -= amount;
    return this.hp <= 0;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const p = this.host.player;
    const s = STATS[this.etype];

    switch (this.etype) {
      case 'imp':
      case 'gargoyle': {
        // patrol, turn at walls/edges
        if (body.blocked.left) this.dir = 1;
        else if (body.blocked.right) this.dir = -1;
        body.setVelocityX(s.speed * this.dir);
        this.setFlipX(this.dir < 0);
        if (this.etype === 'gargoyle' && p.alive && time > this.nextShot) {
          this.nextShot = time + 2600 + Math.random() * 1200;
          this.host.fireEnemyShot(this.x, this.y, p.x, p.y);
        }
        break;
      }
      case 'bat': {
        // flying enemy, tracks player
        if (p.alive) {
          const dx = p.x - this.x;
          const dy = p.y - this.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          body.setVelocity(
            (dx / len) * s.speed,
            (dy / len) * s.speed * 0.8 + Math.sin(time / 180) * 18
          );
          this.setFlipX(dx < 0);
        }
        break;
      }
      case 'skull': {
        // floats in place, shoots projectiles
        body.setVelocity(0, Math.sin(time / 300) * 8);
        if (p.alive && time > this.nextShot) {
          this.nextShot = time + 2200 + Math.random() * 1400;
          this.host.fireEnemyShot(this.x, this.y, p.x, p.y);
        }
        break;
      }
      case 'phantom': {
        // moves through blocks
        if (p.alive) {
          const dx = p.x - this.x;
          const dy = p.y - this.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          body.setVelocity((dx / len) * s.speed, (dy / len) * s.speed);
          this.setFlipX(dx < 0);
        }
        this.setAlpha(0.45 + 0.3 * Math.abs(Math.sin(time / 400)));
        break;
      }
    }
  }
}
