import Phaser from 'phaser';
import { GAME_W, GAME_H, GRAVITY } from './constants';
import { BootScene } from './scenes/BootScene';
import {
  SplashScene,
  MainMenuScene,
  SaveSelectScene,
  EraseSelectScene,
  SettingsScene,
  RemapScene,
  CreditsScene
} from './scenes/MenuScenes';
import {
  WorldMapScene,
  StageSelectScene,
  LevelIntroScene,
  PauseScene,
  LevelCompleteScene,
  SecretFoundScene,
  GameOverScene
} from './scenes/FlowScenes';
import { GameScene } from './scenes/GameScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_W,
    height: GAME_H,
    backgroundColor: '#0a0a23',
    pixelArt: true,
    roundPixels: true,
    fps: { target: 60 },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: GRAVITY }, debug: false }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
      BootScene,
      SplashScene,
      MainMenuScene,
      SaveSelectScene,
      EraseSelectScene,
      SettingsScene,
      RemapScene,
      CreditsScene,
      WorldMapScene,
      StageSelectScene,
      LevelIntroScene,
      GameScene,
      PauseScene,
      LevelCompleteScene,
      SecretFoundScene,
      GameOverScene
    ]
  });
}
