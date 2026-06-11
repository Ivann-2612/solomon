import * as Phaser from 'phaser';
import type { BossType } from '@/types';
import type { EnemyHost } from './Enemy';
import { Audio } from '../audio/audio';

interface BossDef {
  hp: number;
  speed: number;
  shotMs: number;
  phases: number;
}

const DEFS: Record<BossType, BossDef> = {
  flame: { hp: 8, speed: 40, shotMs: 1800, phases: 2 },
  colossus: { hp: 12, speed: 30, shotMs: 2200, phases: 2 },
  serpent: { hp: 14, speed: 55, shotMs: 1600, phases: 2 },
  celestial: { hp: 16, speed: 65, shotMs: 1300, phases: 3 },
  king: { hp: 22, speed: 70, shotMs: 1100, phases: 3 } // final boss: multiple phases
};

export class Boss extends Phaser.Physics.Arcade.Sprite {
  btype: BossType;
  hp: number;
  maxHp: number;
  phase = 1;
  private def: BossDef;
  private host: EnemyHost;
  private nextShot = 0;
  private nextMove = 0;
  private charging = false;

  constructor(scene: EnemyHost, x: number, y: number, type: BossType) {
    super(scene, x, y, `boss-${type}`);
    this.host = scene;
    this.btype = type;
    this.def = DEFS[type];
    this.hp = this.maxHp = this.def.hp;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(26, 26).setOffset(3, 3);
    body.setCollideWorldBounds(true);
  }

  damage(amount: number): boolean {
    this.hp -= amount;
    Audio.sfx('bosshit');
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => this.clearTint());
    const phaseSize = this.maxHp / this.def.phases;
    const newPhase = Math.min(this.def.phases, 1 + Math.floor((this.maxHp - this.hp) / phaseSize));
    if (newPhase > this.phase) this.phase = newPhase;
    return this.hp <= 0;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const p = this.host.player;
    if (!p.alive) {
      body.setVelocity(0, 0);
      return;
    }
    const speed = this.def.speed * (1 + (this.phase - 1) * 0.4);
    const shotMs = this.def.shotMs / (1 + (this.phase - 1) * 0.5);

    // movement: hover pattern, charge at player in later phases
    if (time > this.nextMove) {
      this.nextMove = time + 1200;
      this.charging = this.phase >= 2 && Math.random() < 0.4;
    }
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    if (this.charging) {
      body.setVelocity((dx / len) * speed * 1.6, (dy / len) * speed * 1.6);
    } else {
      body.setVelocity(
        Math.sin(time / 700) * speed,
        Math.cos(time / 900) * speed * 0.5 + (dy > 0 ? 12 : -12)
      );
    }
    this.setFlipX(dx < 0);

    // projectiles
    if (time > this.nextShot) {
      this.nextShot = time + shotMs;
      this.host.fireEnemyShot(this.x, this.y, p.x, p.y);
      if (this.phase >= 3) {
        // spread shot in final phase
        this.host.fireEnemyShot(this.x, this.y, p.x, p.y - 40);
        this.host.fireEnemyShot(this.x, this.y, p.x, p.y + 40);
      }
    }
  }
}
