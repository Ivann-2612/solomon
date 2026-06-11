// Game palette: dark blue, gold, orange, purple, emerald (+ support colors)
export const COLORS: Record<string, string> = {
  K: '#101018', // outline
  D: '#0a0a23', // dark blue bg
  B: '#2a2a55', // blue
  b: '#3d3d7a', // light blue
  W: '#f4f4f4', // white
  w: '#9a9ab0', // gray
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
  M: '#d957d9' // magenta
};

// per-world tint for stone tiles + accent
export const WORLD_TINTS: number[] = [
  0xe25b5b, // Aries - red
  0x2ecc71, // Taurus - emerald
  0xffe89a, // Gemini - light gold
  0x59d9e6, // Cancer - cyan
  0xff9a3c, // Leo - orange
  0x9be29b, // Virgo - pale green
  0xc9c9e6, // Libra - silver
  0xd9577a, // Scorpio - crimson
  0xb98cff, // Sagittarius - violet
  0x8c8ca8, // Capricorn - stone gray
  0x6ab8ff, // Aquarius - blue
  0x7ae6c8, // Pisces - sea green
  0xd957d9, // Secret worlds - magenta
  0xffc83c // Solomon Chamber - gold
];
