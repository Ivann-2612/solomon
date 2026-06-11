import Phaser from 'phaser';
import { makeTextures } from '../assets/textures';
import { START_LIVES, MAX_CONTINUES } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    makeTextures(this);
    this.registry.set('lives', START_LIVES);
    this.registry.set('continues', MAX_CONTINUES);
    this.registry.set('runScore', 0);
    this.registry.set('fire', false);
    this.registry.set('enemiesDefeated', 0);
    this.registry.set('itemsCollected', 0);
    this.scene.start('Splash');
  }
}
