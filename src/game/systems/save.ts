import type { SaveSlot } from '@/types';

const KEY = 'mystic-key-save-v1';
const SCORES_KEY = 'mystic-key-scores-v1';
const SLOTS = 3;

function emptySlot(): SaveSlot {
  return {
    exists: false,
    unlockedStage: 1,
    completedStages: [],
    secretsUnlocked: [],
    solomonSeals: [],
    constellationSeals: [],
    fairies: 0,
    room: 1,
    wingsSkipsUsed: 0,
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

export interface ScoreEntry {
  levelId: number;
  levelName: string;
  score: number;
  date: string;
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
    write(f);
  },
  erase(slot: number) {
    const f = load();
    f.slots[slot] = emptySlot();
    write(f);
  },

  // leaderboard
  addScore(levelId: number, lvlName: string, score: number) {
    try {
      const raw = localStorage.getItem(SCORES_KEY);
      const scores: ScoreEntry[] = raw ? JSON.parse(raw) : [];
      scores.push({
        levelId,
        levelName: lvlName,
        score,
        date: new Date().toLocaleDateString()
      });
      // keep top 50
      scores.sort((a, b) => b.score - a.score);
      scores.splice(50);
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    } catch { /* ignore */ }
  },
  getTopScores(n = 10): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(SCORES_KEY);
      if (!raw) return [];
      const scores: ScoreEntry[] = JSON.parse(raw);
      return scores.sort((a, b) => b.score - a.score).slice(0, n);
    } catch {
      return [];
    }
  },

  // resume on page refresh
  saveLastLevel(levelId: number) {
    try { localStorage.setItem('mk-last-level', String(levelId)); } catch { /* ignore */ }
  },
  getLastLevel(): number | null {
    try {
      const v = localStorage.getItem('mk-last-level');
      return v ? parseInt(v) : null;
    } catch { return null; }
  },
  clearLastLevel() {
    try { localStorage.removeItem('mk-last-level'); } catch { /* ignore */ }
  }
};
