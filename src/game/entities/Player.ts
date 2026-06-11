import * as Phaser from 'phaser';
import { RUN_SPEED, JUMP_VELOCITY } from '../constants';
import { pad, justPressed } from '../systems/input';
import { Audio } from '../audio/audio';

export class Player extends Phaser.Physics.Arcade.Sprite {
  facing: 1 | -1 = 1;
  alive = true;
  invulnUntil = 0;
  private castUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'dana-idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 15).setOffset(2, 1);
    body.setMaxVelocityY(320);
  }

  showCast() {
    this.castUntil = this.scene.time.now + 180;
  }

  hurt(): boolean {
    // returns true if damage was applied
    if (!this.alive || this.scene.time.now < this.invulnUntil) return false;
    this.invulnUntil = this.scene.time.now + 1500;
    Audio.sfx('damage');
    return true;
  }

  kill() {
    if (!this.alive) return;
    this.alive = false;
    Audio.sfx('death');
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -200);
    body.checkCollision.none = true;
    this.setFlipY(true);
  }

  update() {
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

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

    // single jump only - no double jump, no wall slide
    if (justPressed('jump') && onGround) {
      body.setVelocityY(JUMP_VELOCITY);
      Audio.sfx('jump');
    }

    // animation state
    if (this.scene.time.now < this.castUntil) {
      this.anims.stop();
      this.setTexture('dana-cast');
    } else if (!onGround) {
      this.anims.stop();
      this.setTexture('dana-walk');
    } else if (body.velocity.x !== 0) {
      this.play('dana-run', true);
    } else {
      this.anims.stop();
      this.setTexture('dana-idle');
    }

    // invulnerability flicker
    this.setAlpha(this.scene.time.now < this.invulnUntil ? (Math.floor(this.scene.time.now / 80) % 2 ? 0.3 : 1) : 1);
  }
}
