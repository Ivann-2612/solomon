// Game palette — Mystic Key 2026 remaster
export const COLORS: Record<string, string> = {
  K: '#08080f', // outline / dark mortar
  D: '#0a0a23', // dark bg
  B: '#1e1e4a', // blue panel
  b: '#2e2e6a', // mid blue
  W: '#eeeef8', // near-white highlight
  w: '#8888a8', // muted mid (shadow)
  G: '#ffc83c', // gold
  Y: '#fff0a0', // bright gold
  O: '#ff8c2a', // orange
  o: '#c45a18', // dark orange
  P: '#aa5cff', // bright purple (robe highlight)
  p: '#7030cc', // mid purple
  E: '#30e878', // bright emerald
  e: '#1a9a50', // dark emerald
  R: '#ff3a3a', // red
  S: '#ffdab0', // skin
  C: '#44e0f0', // bright cyan
  M: '#e040e0', // magenta
  // Amber — magic block
  N: '#f0b840', // amber bright
  n: '#8a5c10', // amber dark
  F: '#ffe060', // amber highlight
  // Stone/wall
  Q: '#18182a', // dark wall bg
  q: '#101018', // darker wall bg
  // Task 10 — wall/theme palette
  T: '#c87030', // warm stone face
  t: '#7a3c10', // stone shadow
  U: '#ffd090', // stone highlight
  A: '#3a68d0', // blue brick face
  a: '#1e3c8a', // blue brick dark
  L: '#7878a0', // grey brick face
  l: '#444460', // grey brick dark
  s: '#d8a858', // sandstone face
  z: '#7a5820', // sandstone dark
  d: '#28283c', // dark stone face (theme 0)
};

// Per-world tints — vivid, punchy 2026 palette
export const WORLD_TINTS: number[] = [
  0x4ac8e8, // Aries      – sky teal
  0x30d870, // Taurus     – vivid emerald
  0xffcc30, // Gemini     – bright gold
  0x40c8ff, // Cancer     – electric blue
  0xff7020, // Leo        – vivid orange
  0x88e840, // Virgo      – lime
  0xd8d8ff, // Libra      – lavender white
  0xff3060, // Scorpio    – hot crimson
  0xb060ff, // Sagittarius– vivid violet
  0x9090b0, // Capricorn  – silver
  0x2890ff, // Aquarius   – royal blue
  0x20f0c0, // Pisces     – aquamarine
  0xff40e0, // Secret     – vivid magenta
  0xffa000, // Solomon    – deep gold
];
