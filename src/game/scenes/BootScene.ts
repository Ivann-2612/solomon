import * as Phaser from 'phaser';
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

    // Dev shortcut: ?room=N goes directly to a room (bypasses menus)
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        const roomId = parseInt(roomParam, 10);
        if (!isNaN(roomId)) {
          this.scene.start('Game', { roomId });
          return;
        }
      }
    } catch { /* ignore */ }

    this.scene.start('Splash');
  }
}
