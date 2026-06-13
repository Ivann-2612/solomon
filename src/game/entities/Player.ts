import * as Phaser from 'phaser';
import { RUN_SPEED, JUMP_VELOCITY } from '../constants';
import { pad, justPressed } from '../systems/input';
import { Audio } from '../audio/audio';

// Dana sprite is now 24×32 (12×16 pixmap at scale 2).
// Physics body covers face-to-feet, skipping the tall wizard hat.
const NORMAL_W = 12;
const NORMAL_H = 20;
const NORMAL_OX = 6;
const NORMAL_OY = 12;
const DUCK_W   = 12;
const DUCK_H   = 12;
const DUCK_OX   = 6;
const DUCK_OY   = 20;

export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: 1 | -1 = 1;
  alive = true;
  ducking = false;
  private castUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dana-idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(NORMAL_W, NORMAL_H).setOffset(NORMAL_OX, NORMAL_OY);
    body.setMaxVelocityY(320);
  }

  showCast() {
    this.castUntil = this.scene.time.now + 180;
  }

  /** Instant death — called by GameScene when hitting an enemy or hostile shot. */
  die() {
    if (!this.alive) return;
    this.alive = false;
    this.ducking = false;
    Audio.sfx('death');
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -200);
    body.checkCollision.none = true;
    // Restore normal body size so corpse physics look right
    body.setSize(NORMAL_W, NORMAL_H).setOffset(NORMAL_OX, NORMAL_OY);
    this.setFlipY(true);
  }

  /** @deprecated use die() — kept so old kill() call sites don't break during transition */
  kill() { this.die(); }

  update() {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;
    const wantDuck = pad.duck;

    // ---- Duck logic ----
    if (wantDuck && onGround) {
      if (!this.ducking) {
        this.ducking = true;
        body.setSize(DUCK_W, DUCK_H).setOffset(DUCK_OX, DUCK_OY);
      }
      // No horizontal movement while ducking
      body.setVelocityX(0);
    } else {
      if (this.ducking) {
        this.ducking = false;
        body.setSize(NORMAL_W, NORMAL_H).setOffset(NORMAL_OX, NORMAL_OY);
      }
      // ---- Horizontal movement ----
      if (pad.left && !pad.right) {
        body.setVelocityX(-RUN_SPEED);
        this.facing = -1;
        this.setFlipX(true);
      } else if (pad.right && !pad.left) {
        body.setVelocityX(RUN_SPEED);
        this.facing = 1;
        this.setFlipX(false);
      } else {
        body.setVelocityX(0);
      }
    }

    // single jump only - no double jump, no wall slide
    if (justPressed('jump') && onGround && !this.ducking) {
      body.setVelocityY(JUMP_VELOCITY);
      Audio.sfx('jump');
    }

    // ---- animation state ----
    if (this.scene.time.now < this.castUntil) {
      this.anims.stop();
      this.setTexture('dana-cast');
    } else if (this.ducking) {
      this.anims.stop();
      this.setTexture('dana-duck');
    } else if (!onGround) {
      this.anims.stop();
      this.setTexture('dana-walk');
    } else if (body.velocity.x !== 0) {
      this.play('dana-run', true);
    } else {
      this.anims.stop();
      this.setTexture('dana-idle');
    }
  }
}
