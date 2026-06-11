'use client';

import { useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { useSettings } from '@/stores/settingsStore';
import { setPad } from '@/game/systems/input';
import type { Action } from '@/types';
import MobileControls from './MobileControls';

export default function GameShell() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [inGame, setInGame] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [hostStyle, setHostStyle] = useState<React.CSSProperties>({ width: '100%', height: '100%' });
  const keymap = useSettings((s) => s.keymap);

  // boot Phaser
  useEffect(() => {
    let destroyed = false;
    (async () => {
      const { createGame } = await import('@/game');
      if (!destroyed && hostRef.current && !gameRef.current) {
        gameRef.current = createGame(hostRef.current);
      }
    })();
    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // keyboard -> shared pad (respects remapped controls)
  useEffect(() => {
    const find = (code: string): Action | null => {
      for (const a of Object.keys(keymap) as Action[]) {
        if (keymap[a].includes(code)) return a;
      }
      return null;
    };
    const down = (e: KeyboardEvent) => {
      const a = find(e.code);
      if (a) {
        if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
        setPad(a, true);
      }
    };
    const up = (e: KeyboardEvent) => {
      const a = find(e.code);
      if (a) setPad(a, false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [keymap]);

  // touch detection + scene tracking (mobile controls only during gameplay)
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const onScene = (e: Event) => {
      const name = (e as CustomEvent).detail as string;
      setInGame(name === 'Game');
    };
    window.addEventListener('mk-scene', onScene);
    return () => window.removeEventListener('mk-scene', onScene);
  }, []);

  // pixel scale: 'fit' stretches, 'integer' snaps to whole multiples (pixel perfect)
  useEffect(() => {
    const apply = () => {
      const { pixelScale } = useSettings.getState();
      if (pixelScale === 'integer') {
        const k = Math.max(1, Math.floor(Math.min(window.innerWidth / 360, window.innerHeight / 336)));
        setHostStyle({ width: 360 * k, height: 336 * k });
      } else {
        setHostStyle({ width: '100%', height: '100%' });
      }
      gameRef.current?.scale.refresh();
    };
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('mk-rescale', apply);
    return () => {
      window.removeEventListener('resize', apply);
      window.removeEventListener('mk-rescale', apply);
    };
  }, []);

  // PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <div id="game-root">
      <div ref={hostRef} style={hostStyle} id="game-canvas-host" />
      {isTouch && <MobileControls visible={inGame} />}
    </div>
  );
}
