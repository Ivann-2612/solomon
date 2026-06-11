// Game palette — Solomon's Key remaster colors
export const COLORS: Record<string, string> = {
  K: '#0a0a12', // outline / dark mortar
  D: '#0a0a23', // dark bg
  B: '#2a2a55', // blue panel
  b: '#3d3d7a', // mid blue
  W: '#f4f4f4', // white (stone face — tints to world color)
  w: '#9a9ab0', // gray (stone shadow row)
  G: '#ffc83c', // gold
  Y: '#ffe89a', // light gold
  O: '#ff7f27', // orange
  o: '#b3541e', // dark orange
  P: '#8c4bd9', // purple
  p: '#5d2e99', // dark purple
  E: '#2ecc71', // emerald
  e: '#1d8c4c', // dark emerald
  R: '#e23b3b', // red
  S: '#ffd9a0', // skin
  C: '#59d9e6', // cyan
  M: '#d957d9', // magenta
  // Amber — magic block (NOT tinted, fixed sand color)
  N: '#d4a848', // amber bright
  n: '#7a5818', // amber dark
  F: '#f0c060', // amber highlight
  // Stone-dark for BG
  Q: '#1c1c2a', // dark wall bg
  q: '#141420', // darker wall bg
};

// Per-world tint applied to stone tiles (pure white → this color)
export const WORLD_TINTS: number[] = [
  0x5bbccf, // Aries      – teal blue (original SK feel)
  0x48c878, // Taurus     – emerald green
  0xffd84a, // Gemini     – gold yellow
  0x50c8e8, // Cancer     – sky blue
  0xff8844, // Leo        – orange
  0x80d870, // Virgo      – lime green
  0xd8d8f8, // Libra      – silver white
  0xe84870, // Scorpio    – crimson
  0xa870ff, // Sagittarius– violet
  0x909098, // Capricorn  – stone gray
  0x4898ff, // Aquarius   – blue
  0x48f0b8, // Pisces     – cyan teal
  0xe050e0, // Secret     – magenta
  0xffc030, // Solomon    – gold
];
