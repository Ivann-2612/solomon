'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { useSettings } from '@/stores/settingsStore';
import { setPad } from '@/game/systems/input';
import type { Action } from '@/types';
import MobileControls from './MobileControls';

function detectIOS() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  return typeof window !== 'undefined' && (window.navigator as any).standalone === true;
}

export default function GameShell() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [inGame, setInGame] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [hostStyle, setHostStyle] = useState<React.CSSProperties>({});
  const keymap = useSettings((s) => s.keymap);

  const toggleFullscreen = useCallback(async () => {
    if (detectIOS() && !isStandalone()) {
      // iOS Safari can't go fullscreen; nudge user to install as PWA
      setIosHint(true);
      setTimeout(() => setIosHint(false), 3500);
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        try { await (screen.orientation as any).lock('landscape'); } catch { /* not all browsers */ }
      } else {
        await document.exitFullscreen();
      }
    } catch { /* denied / not supported */ }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // boot Phaser
  useEffect(() => {
    let destroyed = false;
    (async () => {
      const { createGame } = await import('@/game');
      if (!destroyed && hostRef.current && !gameRef.current) {
        gameRef.current = createGame(hostRef.current);
        // Force Scale Manager to re-measure canvas bounds at multiple points so
        // mobile URL-bar hide and other layout shifts don't leave bounds stale.
        const refreshScale = () => {
          gameRef.current?.scale.refresh();
          window.dispatchEvent(new Event('resize'));
        };
        requestAnimationFrame(refreshScale);
        setTimeout(refreshScale, 250);
        setTimeout(refreshScale, 800);
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
    // Try to lock orientation to landscape on mobile
    try {
      const so = (screen as any).orientation;
      if (so && so.lock) so.lock('landscape').catch(() => {});
    } catch { /* not supported */ }
    return () => window.removeEventListener('mk-scene', onScene);
  }, []);

  // pixel scale: 'fit' stretches, 'integer' snaps to whole multiples (pixel perfect)
  useEffect(() => {
    const apply = () => {
      const { pixelScale } = useSettings.getState();
      if (pixelScale === 'integer') {
        const k = Math.max(1, Math.floor(Math.min(window.innerWidth / 360, window.innerHeight / 336)));
        const w = 360 * k;
        const h = 336 * k;
        const left = Math.round((window.innerWidth - w) / 2);
        const top = Math.round((window.innerHeight - h) / 2);
        setHostStyle({ width: w, height: h, position: 'absolute', left, top });
      } else {
        setHostStyle({});
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
      {isTouch && (
        <button
          className="mk-fs-btn"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '✕' : '⤢'}
        </button>
      )}
      {/* iOS fullscreen hint */}
      {iosHint && (
        <div className="mk-ios-hint">
          Tap <strong>Share</strong> → <strong>Add to Home Screen</strong> for fullscreen
        </div>
      )}
      {/* Landscape hint — only shown in CSS portrait media query */}
      <div id="rotate-hint">
        <div id="rotate-icon">&#8635;</div>
        <div>Please rotate your device</div>
        <div style={{ fontSize: '11px', marginTop: 4, opacity: 0.7 }}>Mystic Key plays in landscape</div>
      </div>
    </div>
  );
}
