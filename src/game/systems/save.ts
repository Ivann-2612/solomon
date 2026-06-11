import type { SaveSlot } from '@/types';

const KEY = 'mystic-key-save-v1';
const SLOTS = 3;

function emptySlot(): SaveSlot {
  return {
    exists: false,
    unlockedStage: 1,
    completedStages: [],
    secretsUnlocked: [],
    seals: [],
    crowns: [],
    orbs: [],
    pages: { time: false, space: false },
    princessUnlocked: false,
    totalScore: 0,
    itemsCollected: 0,
    secretsFound: 0,
    bestGDV: 0,
    bestGrade: '-'
  };
}

interface SaveFile {
  slots: SaveSlot[];
}

function load(): SaveFile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const f = JSON.parse(raw) as SaveFile;
      while (f.slots.length < SLOTS) f.slots.push(emptySlot());
      return f;
    }
  } catch {
    /* corrupted save -> reset */
  }
  return { slots: Array.from({ length: SLOTS }, emptySlot) };
}

function write(f: SaveFile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(f));
  } catch {
    /* storage full / private mode */
  }
}

let active = 0;

export const SaveSystem = {
  slots(): SaveSlot[] {
    return load().slots;
  },
  select(slot: number) {
    active = slot;
  },
  activeIndex() {
    return active;
  },
  current(): SaveSlot {
    return load().slots[active];
  },
  update(mut: (s: SaveSlot) => void) {
    const f = load();
    const s = f.slots[active];
    s.exists = true;
    mut(s);
    write(f); // autosave
  },
  erase(slot: number) {
    const f = load();
    f.slots[slot] = emptySlot();
    write(f);
  }
};
