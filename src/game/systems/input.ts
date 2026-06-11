import type { Action } from '@/types';

// Shared input bus between React (touch controls) and Phaser (keyboard).
export interface PadState {
  left: boolean;
  right: boolean;
  jump: boolean;
  duck: boolean;
  create: boolean;
  destroy: boolean;
  fire: boolean;
  pause: boolean;
}

export const pad: PadState = {
  left: false,
  right: false,
  jump: false,
  duck: false,
  create: false,
  destroy: false,
  fire: false,
  pause: false
};

// edge-trigger helpers (consume once per press)
const consumed: Partial<Record<Action, boolean>> = {};

export function justPressed(action: Action): boolean {
  if (pad[action] && !consumed[action]) {
    consumed[action] = true;
    return true;
  }
  if (!pad[action]) consumed[action] = false;
  return false;
}

export function setPad(action: Action, down: boolean) {
  pad[action] = down;
}

export function resetPad() {
  (Object.keys(pad) as Action[]).forEach((k) => (pad[k] = false));
}

export const DEFAULT_KEYMAP: Record<Action, string[]> = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  jump: ['Space', 'KeyZ', 'ArrowUp', 'KeyW'],
  duck: ['ArrowDown', 'KeyS'],
  create: ['KeyX', 'KeyJ'],
  destroy: ['KeyC', 'KeyK'],
  fire: ['KeyV', 'KeyL'],
  pause: ['Escape', 'KeyP']
};
