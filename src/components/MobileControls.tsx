'use client';

import { useCallback } from 'react';
import { setPad } from '@/game/systems/input';
import type { Action } from '@/types';
import { useSettings } from '@/stores/settingsStore';

function haptic() {
  try {
    navigator.vibrate?.(12);
  } catch {
    /* unsupported */
  }
}

interface BtnProps {
  action: Action;
  label: string;
  style: React.CSSProperties;
}

function Btn({ action, label, style }: BtnProps) {
  const down = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setPad(action, true);
      haptic();
    },
    [action]
  );
  const up = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setPad(action, false);
    },
    [action]
  );
  return (
    <div
      className="mk-btn"
      style={style}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </div>
  );
}

export default function MobileControls({ visible }: { visible: boolean }) {
  const uiScale = useSettings((s) => s.mobileUiScale);
  if (!visible) return null;
  const s = uiScale;
  const d = 56 * s; // d-pad button size
  const a = 52 * s; // action button size
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 [&>*]:pointer-events-auto">
        {/* Virtual D-Pad - left side */}
        <Btn
          action="left"
          label="◀"
          style={{ left: 14, bottom: 24 + d * 0.45, width: d, height: d, fontSize: d * 0.4 }}
        />
        <Btn
          action="right"
          label="▶"
          style={{ left: 14 + d + 10, bottom: 24 + d * 0.45, width: d, height: d, fontSize: d * 0.4 }}
        />
        {/* Action buttons - right side */}
        <Btn
          action="jump"
          label="A"
          style={{ right: 16, bottom: 20, width: a, height: a, fontSize: a * 0.42 }}
        />
        <Btn
          action="fire"
          label="🔥"
          style={{ right: 16 + a + 10, bottom: 20 + a * 0.6, width: a, height: a, fontSize: a * 0.36 }}
        />
        <Btn
          action="create"
          label="▣"
          style={{ right: 16, bottom: 20 + a + 14, width: a, height: a, fontSize: a * 0.42 }}
        />
        <Btn
          action="destroy"
          label="✖"
          style={{ right: 16 + a + 10, bottom: 20 + a * 1.6 + 14, width: a, height: a, fontSize: a * 0.38 }}
        />
        {/* Pause - top right */}
        <Btn
          action="pause"
          label="⏸"
          style={{ right: 12, top: 10, width: 40 * s, height: 40 * s, fontSize: 16 * s }}
        />
      </div>
    </div>
  );
}
