import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Action } from '@/types';
import { DEFAULT_KEYMAP } from '@/game/systems/input';

export interface SettingsState {
  soundVol: number; // 0..1
  musicVol: number; // 0..1
  pixelScale: 'fit' | 'integer';
  highContrast: boolean;
  mobileUiScale: number; // 0.75..1.5
  keymap: Record<Action, string[]>;
  set: (p: Partial<SettingsState>) => void;
  remap: (action: Action, code: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      soundVol: 0.8,
      musicVol: 0.6,
      pixelScale: 'fit',
      highContrast: false,
      mobileUiScale: 1,
      keymap: DEFAULT_KEYMAP,
      set: (p) => set(p),
      remap: (action, code) =>
        set((s) => ({ keymap: { ...s.keymap, [action]: [code] } }))
    }),
    {
      name: 'mystic-key-settings',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export function getSettings() {
  return useSettings.getState();
}
