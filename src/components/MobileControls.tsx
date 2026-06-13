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
  const d = 58 * s;   // d-pad button size
  const a = 56 * s;   // action button size
  const gap = 8 * s;  // gap between d-pad buttons

  // Cross D-pad positions: proper +-layout, all on-screen
  // Row centres from bottom:  down=gap+d/2,  mid=gap+d+gap+d/2,  up=gap+d+gap+d+gap+d/2
  const midBottom   = gap + d + gap;           // bottom of left/right buttons
  const upBottom    = midBottom + d + gap;     // bottom of up button
  const downBottom  = gap;                     // bottom of down button
  const dpadCenterL = 14 + d + gap / 2 - d / 2; // horizontal center of cross

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 [&>*]:pointer-events-auto">
        {/* Virtual D-Pad — proper cross layout */}
        <Btn
          action="left"
          label="◀"
          style={{ left: 14, bottom: midBottom, width: d, height: d, fontSize: d * 0.52 }}
        />
        <Btn
          action="right"
          label="▶"
          style={{ left: 14 + d + gap, bottom: midBottom, width: d, height: d, fontSize: d * 0.52 }}
        />
        <Btn
          action="up"
          label="▲"
          style={{ left: dpadCenterL, bottom: upBottom, width: d, height: d, fontSize: d * 0.52 }}
        />
        <Btn
          action="duck"
          label="▼"
          style={{ left: dpadCenterL, bottom: downBottom, width: d, height: d, fontSize: d * 0.52 }}
        />
        {/* Action buttons - right side */}
        <Btn
          action="jump"
          label="A"
          style={{ right: 16, bottom: 20, width: a, height: a, fontSize: a * 0.52 }}
        />
        <Btn
          action="fire"
          label="🔥"
          style={{ right: 16 + a + 10, bottom: 20 + a * 0.6, width: a, height: a, fontSize: a * 0.46 }}
        />
        <Btn
          action="create"
          label="▣"
          style={{ right: 16, bottom: 20 + a + 12, width: a, height: a, fontSize: a * 0.52 }}
        />
        <Btn
          action="destroy"
          label="✖"
          style={{ right: 16 + a + 10, bottom: 20 + a * 1.6 + 12, width: a, height: a, fontSize: a * 0.52 }}
        />
        {/* Pause - bottom center */}
        <Btn
          action="pause"
          label="⏸"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 8,
            width: 44 * s,
            height: 36 * s,
            fontSize: 18 * s,
          }}
        />
      </div>
    </div>
  );
}
