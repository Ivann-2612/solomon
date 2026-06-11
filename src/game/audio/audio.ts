// Procedural retro chiptune engine - zero audio files, Web Audio only.
import { getSettings } from '@/stores/settingsStore';

export type SfxName =
  | 'jump'
  | 'create'
  | 'break'
  | 'fireball'
  | 'key'
  | 'door'
  | 'damage'
  | 'death'
  | 'coin'
  | 'gem'
  | 'chest'
  | 'secret'
  | 'ui'
  | 'pause'
  | 'bosshit';

export type MusicTheme = 'menu' | 'world' | 'boss' | 'victory' | 'gameover' | 'none';

type Wave = OscillatorType;

class Engine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private theme: MusicTheme = 'none';
  private step = 0;
  private worldSeed = 0;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain.connect(this.ctx.destination);
      this.musicGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.sfxGain!.gain.value = getSettings().soundVol;
    this.musicGain!.gain.value = getSettings().musicVol * 0.55;
    return this.ctx;
  }

  unlock() {
    this.ensure();
  }

  private tone(
    freq: number,
    dur: number,
    wave: Wave = 'square',
    vol = 0.25,
    when = 0,
    slide = 0,
    dest?: GainNode
  ) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(dest ?? this.sfxGain!);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol = 0.2, when = 0) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(g);
    g.connect(this.sfxGain!);
    src.start(t);
  }

  sfx(name: SfxName) {
    switch (name) {
      case 'jump':
        this.tone(220, 0.12, 'square', 0.2, 0, 240);
        break;
      case 'create':
        this.tone(330, 0.08, 'triangle', 0.25);
        this.tone(494, 0.1, 'triangle', 0.2, 0.05);
        break;
      case 'break':
        this.noise(0.12, 0.25);
        this.tone(180, 0.1, 'square', 0.15, 0, -80);
        break;
      case 'fireball':
        this.tone(520, 0.15, 'sawtooth', 0.18, 0, -300);
        this.noise(0.08, 0.1);
        break;
      case 'key':
        [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.1, 'square', 0.2, i * 0.07));
        break;
      case 'door':
        [262, 330, 392, 523].forEach((f, i) => this.tone(f, 0.15, 'triangle', 0.22, i * 0.1));
        break;
      case 'damage':
        this.tone(200, 0.2, 'sawtooth', 0.25, 0, -120);
        break;
      case 'death':
        [392, 330, 262, 196, 131].forEach((f, i) =>
          this.tone(f, 0.18, 'square', 0.22, i * 0.12)
        );
        break;
      case 'coin':
        this.tone(988, 0.06, 'square', 0.18);
        this.tone(1319, 0.12, 'square', 0.16, 0.06);
        break;
      case 'gem':
        this.tone(784, 0.07, 'triangle', 0.2);
        this.tone(1175, 0.14, 'triangle', 0.18, 0.07);
        break;
      case 'chest':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.1, 'square', 0.2, i * 0.06));
        break;
      case 'secret':
        [523, 622, 740, 880, 1047].forEach((f, i) =>
          this.tone(f, 0.12, 'triangle', 0.22, i * 0.09)
        );
        break;
      case 'ui':
        this.tone(660, 0.06, 'square', 0.12);
        break;
      case 'pause':
        this.tone(440, 0.08, 'square', 0.15);
        this.tone(330, 0.1, 'square', 0.15, 0.08);
        break;
      case 'bosshit':
        this.tone(120, 0.18, 'sawtooth', 0.3, 0, -40);
        this.noise(0.1, 0.2);
        break;
    }
  }

  setWorld(idx: number) {
    this.worldSeed = idx;
  }

  music(theme: MusicTheme) {
    if (theme === this.theme) return;
    this.stopMusic();
    this.theme = theme;
    if (theme === 'none') return;
    const ctx = this.ensure();
    if (!ctx) return;
    this.step = 0;
    const bpmMap: Record<string, number> = {
      menu: 110,
      world: 128,
      boss: 150,
      victory: 120,
      gameover: 70
    };
    const interval = 60000 / bpmMap[theme] / 2; // 8th notes
    this.musicTimer = setInterval(() => this.tick(), interval);
  }

  private tick() {
    const g = this.musicGain!;
    const minor = [0, 2, 3, 5, 7, 8, 10, 12];
    const base: Record<string, number> = {
      menu: 220,
      world: 196 * Math.pow(2, (this.worldSeed % 5) / 12),
      boss: 165,
      victory: 262,
      gameover: 147
    };
    const root = base[this.theme] ?? 220;
    const s = this.step++;
    const bar = Math.floor(s / 8) % 4;
    // bass on quarters
    if (s % 2 === 0) {
      const bn = [0, 0, 5, 7][bar];
      this.tone(root / 2 * Math.pow(2, minor[bn % 8] / 12), 0.18, 'triangle', 0.18, 0, 0, g);
    }
    // melody
    const pat = [0, 3, 5, 7, 8, 7, 5, 3];
    if (this.theme === 'gameover') {
      if (s % 4 === 0) {
        const n = [7, 5, 3, 0][bar];
        this.tone(root * Math.pow(2, minor[n] / 12), 0.4, 'square', 0.12, 0, 0, g);
      }
    } else if (this.theme === 'victory') {
      const vp = [0, 4, 7, 12, 7, 4, 7, 12];
      this.tone(root * Math.pow(2, vp[s % 8] / 12), 0.14, 'square', 0.12, 0, 0, g);
    } else {
      const off = this.theme === 'boss' ? (s % 3) * 2 : 0;
      const n = pat[(s + bar + off) % 8];
      this.tone(root * Math.pow(2, minor[n % 8] / 12), 0.12, 'square', 0.1, 0, 0, g);
      if (this.theme === 'boss' && s % 4 === 2) this.noise(0.05, 0.08);
    }
  }

  stopMusic() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.theme = 'none';
  }
}

export const Audio = new Engine();
