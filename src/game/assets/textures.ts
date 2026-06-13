import * as Phaser from 'phaser';
import { COLORS } from './palette';

type PixMap = string[];

function drawMap(
  scene: Phaser.Scene,
  key: string,
  map: PixMap,
  scale = 2,
  palette: Record<string, string> = COLORS
) {
  if (scene.textures.exists(key)) return;
  const h = map.length;
  const w = map[0].length;
  const canvas = scene.textures.createCanvas(key, w * scale, h * scale);
  if (!canvas) return;
  const ctx = canvas.getContext();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = map[y][x];
      if (c === '.' || c === ' ') continue;
      ctx.fillStyle = palette[c] ?? '#ff00ff';
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  canvas.refresh();
}

function makeParticle(scene: Phaser.Scene, key: string, color: string, size = 3) {
  if (scene.textures.exists(key)) return;
  const canvas = scene.textures.createCanvas(key, size, size);
  if (!canvas) return;
  const ctx = canvas.getContext();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  canvas.refresh();
}

// ---- Entity sprites 8x8 (scale x2 = 16x16) ----

// Dana – wizard, 12×16 pixmap (scale×2 = 24×32 sprite)
const DANA_IDLE = [
  '....YY......',  // 0  hat tip sparkle (Y=light gold)
  '....pp......',  // 1  hat tip
  '...pPPp.....',  // 2  hat upper
  '..pPPPPp....',  // 3  hat mid
  '.pPPPPPPp...',  // 4  hat lower (widest)
  '.GGGGGGGGo..',  // 5  gold brim, o=shadow right
  '.KSSGoGSSK..',  // 6  face: G=gold eyes, o=dark nose
  '.KSSSoSSSK..',  // 7  chin/face lower
  'KKGGGGGGGGKK',  // 8  gold collar
  'KPPpPPPpPPKK',  // 9  robe shoulders
  'KPPpGGGpPPKK',  // 10 belt buckle (G=gold)
  'KPPpPPPpPPKK',  // 11 robe lower
  '.KPPpPPpPPK.',  // 12 robe hem
  '..KPPpPPPK..',  // 13 robe tail
  '..KOK..KOK..',  // 14 boots (O=bright orange)
  '..KoK..KoK..',  // 15 boot soles (o=dark orange)
];
const DANA_WALK = [
  '....YY......',
  '....pp......',
  '...pPPp.....',
  '..pPPPPp....',
  '.pPPPPPPp...',
  '.GGGGGGGGo..',
  '.KSSGoGSSK..',
  '.KSSSoSSSK..',
  'KKGGGGGGGGKK',
  'KPPpPPPpPPKK',
  'KPPpGGGpPPKK',
  'KPPpPPPpPPKK',
  '.KPPpPPpPPK.',
  '..KPPpPPPK..',
  '..KOK...KoK.',  // stride: left foot forward (O=bright), right trailing (o=dark)
  '..KoK...KKK.',  // soles: left down, right foot lifted
];
// Dana crouching — hat still visible, body compressed into bottom half
const DANA_DUCK = [
  '............',  // 0  empty (hat hidden)
  '....YY......',  // 1  hat tip
  '....pp......',  // 2
  '...pPPp.....',  // 3  hat body compressed
  '..pPPPPp....',  // 4
  '.GGGGGGGGo..',  // 5  gold brim (hat low)
  '.KSSGoGSSK..',  // 6  face
  '.KSSSoSSSK..',  // 7  chin
  'KKGGGGGGGGKK',  // 8  gold collar
  'KPPpGGGpPPKK',  // 9  belt only (no shoulder rows)
  '.KPPpPPpPPK.',  // 10 robe squished
  '..KPPpPPPK..',  // 11 robe hem
  '..KOK..KOK..',  // 12 boots
  '..KoK..KoK..',  // 13 boot soles
  '............',  // 14
  '............',  // 15
];

const DANA_CAST = [
  '....YY......',
  '....pp......',
  '...pPPp.....',
  '..pPPPPp....',
  '.pPPPPPPp...',
  '.GGGGGGGGo..',
  '.KSSGoGSSK..',
  '.KSSSoSSSK..',
  'KKGGGGGGGGKK',
  'KPPpPPCCCCoo',  // arm extended: CCCC=cyan staff, oo=orange glow tip
  'KPPpGGGpPPKK',  // belt same
  'KPPpPPPpPPKK',
  '.KPPpPPpPPK.',
  '..KPPpPPPK..',
  '..KOK..KOK..',
  '..KoK..KoK..',
];

// Imp – green goblin, horns, yellow eyes
const IMP = [
  '.EK..KE.',
  'EEKKEEKE',
  'KEEEEEEK',
  'KEeGGeEK',
  'KEEEEEEK',
  '.KEEEEK.',
  'KE.EE.EK',
  '.E....E.',
];
const IMP2 = [
  '.EK..KE.',
  'EEKKEEKE',
  'KEEEEEEK',
  'KEeGGeEK',
  'KEEEEEEK',
  '.KEEEEK.',
  '.KE..EK.',
  'KE....EK',
];

// Demon Bat – magenta/pink flying enemy, spread wings
const BAT = [
  'M......M',
  'MM.MM.MM',
  'MMMMMMMM',
  '.MMYYMM.',
  '..MKKM..',
  '..M..M..',
  '........',
  '........',
];
const BAT2 = [
  '........',
  '.M....M.',
  'MM.MM.MM',
  '.MMYYMM.',
  'MMMMMMMM',
  'M.M..M.M',
  '........',
  '........',
];

// Fire Skull – white skull with orange fire
const SKULL = [
  '.WWWWWW.',
  'WWWWWWWW',
  'WKWwwwKW',
  'WWwwwwWW',
  '.WWWWWW.',
  '.WOOWOW.',
  '..OOOO..',
  '...OO...',
];
const SKULL2 = [
  '.WWWWWW.',
  'WWWWWWWW',
  'WKWwwwKW',
  'WWwwwwWW',
  '.WWWWWW.',
  '.WOOWOW.',
  '.OWWWWO.',
  '..OWWO..',
];

// Phantom – cyan ghost, semi-transparent in code
const PHANTOM = [
  '..CCCC..',
  '.CWWWWC.',
  '.CKbbKC.',
  '.CWWWWC.',
  '.CCCCCC.',
  '.CC.CC..',
  '.C...C..',
  '........',
];
const PHANTOM2 = [
  '..CCCC..',
  '.CWWWWC.',
  '.CKbbKC.',
  '.CWWWWC.',
  '.CCCCCC.',
  '.CcCcCC.',
  '..C..C..',
  '.C.CC.C.',
];

// Gargoyle – stone blue boss-type, heavy
const GARGOYLE = [
  'b......b',
  'bb.bb.bb',
  '.bbbbbb.',
  '.bYbbYb.',
  '.bbbbbb.',
  '..bbbb..',
  '.b.bb.b.',
  '.b....b.',
];
const GARGOYLE2 = [
  'b......b',
  '.b.bb.b.',
  '.bbbbbb.',
  '.bYbbYb.',
  '.bbbbbb.',
  '..bbbb..',
  '.b.bb.b.',
  'b......b',
];

// Fireball – warm orange glow
const FIREBALL = [
  '..OOO...',
  '.OYYOO..',
  'OYYYYOO.',
  'OYYYYOO.',
  '.OYYOO..',
  '..OOO...',
];

// Enemy shot – red bolt
const SHOT = ['.RR.', 'ROOR', 'ROOR', '.RR.'];

// ---- Items 8x8 (scale x2 = 16x16) ----

// Key – classic golden key shape
const KEY_SPR = [
  '.GGG....',
  'G...G...',
  'G...G...',
  '.GGG....',
  '..G.....',
  '..GGG...',
  '..G.....',
  '..GG....',
];

// Coin – bright yellow star shape (original SK style)
const COIN = [
  '...GG...',
  '..GYYG..',
  '.GYYYYG.',
  'GGYYYYGG',
  '.GYYYYG.',
  '..GYYG..',
  '...GG...',
  '........',
];

// Gem – emerald green faceted
const GEM = [
  '..EEEE..',
  '.EeEEeE.',
  'EEEEEEEE',
  '.EEEEEE.',
  '..EEEE..',
  '...EE...',
  '........',
  '........',
];

// Chest – gold and brown treasure
const CHEST = [
  '.GGGGGG.',
  'GYYYYYYY',
  'GGGGGGGG',
  'GYGoGGYG',
  'GYYYYYYY',
  '.GGGGGG.',
  '........',
  '........',
];

// Life – red heart
const LIFE = [
  '.RR..RR.',
  'RRRRRRRR',
  'RRRRRRRR',
  '.RRRRRR.',
  '..RRRR..',
  '...RR...',
  '........',
  '........',
];

// Time extension – hourglass
const TIME_SPR = [
  '.WWWWWW.',
  'WWwwwwWW',
  '.WwwwwW.',
  '..WGGW..',
  '.WwwwwW.',
  'WWwwwwWW',
  '.WWWWWW.',
  '........',
];

// Fire upgrade – flame
const FIRE_UP = [
  '....O...',
  '...OO...',
  '..OOOO..',
  '.OYYOO..',
  'OOYYYYO.',
  '.OOYYO..',
  '..OOO...',
  '........',
];

// Seal fragment – purple gem with gold border
const SEAL = [
  '..PPPP..',
  '.PGGGGP.',
  'PGpPPpGP',
  'PGpPPpGP',
  '.PGGGGP.',
  '..PPPP..',
  '........',
  '........',
];

// Crown
const CROWN = [
  'G..G..GG',
  'GG.GG.GG',
  'GGGGGGGG',
  'GYYYYYYY',
  'GGGGGGGG',
  '........',
  '........',
  '........',
];

// Orb – cyan mystic orb
const ORB = [
  '..CCCC..',
  '.CWWWWC.',
  'CWWbbWWC',
  'CWWbbWWC',
  '.CWWWWC.',
  '..CCCC..',
  '........',
  '........',
];

// ---- Tiles 12x12 (scale x2 = 24x24) ----

// Stone tile — 3-D bevel: W=bright top+left highlight, w=muted face, both tinted by world color
const STONE = [
  'KKKKKKKKKKKK',
  'KWWWWWWWWWWK',  // top highlight row
  'KWWwwwwwwwwK',  // left highlight + muted face
  'KWWwwwwwwwwK',
  'KWWwwwwwwwwK',
  'KWWwwwwwwwwK',
  'KWWwwwwwwwwK',
  'KWWwwwwwwwwK',
  'KWWwwwwwwwwK',
  'KWWwwwwwwwwK',
  'KwwwwwwwwwwK',  // bottom shadow
  'KKKKKKKKKKKK',
];

// Magic block — amber with inner glow effect: N=amber, n=dark amber, F=highlight, Y=bright center
const MAGIC = [
  'KKKKKKKKKKKK',
  'KFNNNNNNNNnK',  // top: amber highlight
  'KFNnnnnnnnNK',  // inner dark surround
  'KFNnGGGGnnNK',  // gold inner frame
  'KFNnGYYGnnNK',  // bright glow center (Y=light gold)
  'KFNnGYYGnnNK',
  'KFNnGYYGnnNK',
  'KFNnGYYGnnNK',
  'KFNnGGGGnnNK',
  'KFNnnnnnnnNK',
  'KFNNNNNNNNnK',  // bottom
  'KKKKKKKKKKKK',
];

// Door closed — ornate arch, purple/dark
const DOOR_CLOSED = [
  '..pppppppp..',
  '.pPPPPPPPPp.',
  'pPPpppppppPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pPpDKKKKDpPp',
  'pPpDKKKKDpPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pppppppppppp',
];
const DOOR_OPEN = [
  '..pppppppp..',
  '.pGGGGGGGGp.',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pGYYYYYYYYGp',
  'pppppppppppp',
];

// Spawn portal — rotating magenta/purple ring
const PORTAL = [
  '....MMMM....',
  '..MM....MM..',
  '.M..MMMM..M.',
  'M..M....M..M',
  'M.M..MM..M.M',
  'M.M.MPPM.M.M',
  'M.M.MPPM.M.M',
  'M.M..MM..M.M',
  'M..M....M..M',
  '.M..MMMM..M.',
  '..MM....MM..',
  '....MMMM....',
];

// Spark effect
const SPARK = ['.Y.', 'YGY', '.Y.'];

// Sparkle star — small white twinkle drawn on wall tiles
const SPARKLE = [
  '..W..',
  '..Y..',
  'WYGYW',
  '..Y..',
  '..W..',
];

// ---- Task 10: walls + frame themes (12x12, scale x2 = 24x24) ----

// Main wall — warm orange/tan textured raised block (original SK-style feel)
// U = top/left highlight, T = face, t = bottom/right shadow
const WALL_MAIN = [
  'KKKKKKKKKKKK',
  'KUUUUUUUUUtK',
  'KUTTTTTTTTtK',
  'KUTTtTTTTTtK',
  'KUTTTTTTtTtK',
  'KUTTTTTTTTtK',
  'KUTtTTTTTTtK',
  'KUTTTTtTTTtK',
  'KUTTTTTTTTtK',
  'KUtTTTTTTTtK',
  'KttttttttttK',
  'KKKKKKKKKKKK',
];

// Brick course pattern — recolored per theme (A = face, a = dark/shadow)
const BRICK = [
  'KKKKKKKKKKKK',
  'KAAAAaKAAAAa',
  'KAAAAaKAAAAa',
  'KaaaaaKaaaaa',
  'KKKKKKKKKKKK',
  'AAaKAAAAAaKA',
  'AAaKAAAAAaKA',
  'aaaKaaaaaaKa',
  'KKKKKKKKKKKK',
  'KAAAAaKAAAAa',
  'KAAAAaKAAAAa',
  'KaaaaaKaaaaa',
];

// Dark stone — large rough-cut blocks (theme 0)
const DARK_STONE = [
  'qqqqqqqqqqqq',
  'qddddddddddq',
  'qdQddddddQdq',
  'qddddQdddddq',
  'qddddddddddq',
  'qqqqqqqqqqqq',
  'ddddqQdddddd',
  'dQddqddddQdd',
  'ddddqddQdddd',
  'ddddqddddddd',
  'qqqqqqqqqqqq',
  'qqqqqqqqqqqq',
];

// Gargoyle statue — corner decoration for theme 0 (grey stone, gold eyes)
const GARGOYLE_STATUE = [
  'w..........w',
  'ww...ww...ww',
  '.w.wwwwww.w.',
  '.wwwGwwGwww.',
  '..wwwwwwww..',
  '..www..www..',
  '...wwwwww...',
  '..ww.ww.ww..',
  '..w..ww..w..',
  '.ww.wwww.ww.',
  '.w..w..w..w.',
  'wwwwwwwwwwww',
];

// ---- Task 10: item sprites (8x8, scale x2 = 16x16) ----

const BELL = [
  '...GG...',
  '..GYYG..',
  '..GYYG..',
  '.GYYYYG.',
  '.GYYYYG.',
  'GGGGGGGG',
  '...oo...',
  '........',
];

const FAIRY = [
  'C..WW..C',
  'CC.SS.CC',
  'CCWWWWCC',
  '.CWWWWC.',
  '..MWWM..',
  '..WWWW..',
  '...WW...',
  '........',
];

// Jar — recolored per type (C = glass, B = liquid)
const JAR = [
  '...KK...',
  '..CCCC..',
  '...CC...',
  '..CBBC..',
  '.CBBBBC.',
  '.CBBBBC.',
  '..CCCC..',
  '........',
];

// Crystal shard — recolored per type
const CRYSTAL = [
  '...C....',
  '..CWC...',
  '..CCC...',
  '.CCWCC..',
  '.CCCCC..',
  '..CCC...',
  '...C....',
  '........',
];

// Medicine bottle — recolored per type
const MEDICINE = [
  '...ww...',
  '...KK...',
  '..RRRR..',
  '.RRWRRR.',
  '.RRRRRR.',
  '.RRRRRR.',
  '..RRRR..',
  '........',
];

const WINGS = [
  'WW....WW',
  'WWW..WWW',
  'WWWWWWWW',
  'wWWWWWWw',
  '.wWWWWw.',
  '..W..W..',
  '........',
  '........',
];

// Seal of Solomon — gold star seal
const SEAL_SOLOMON = [
  '...GG...',
  '..GYYG..',
  '.GYGGYG.',
  'GYYGGYYG',
  '.GYGGYG.',
  '..GYYG..',
  '...GG...',
  '........',
];

// Constellation sign — stone tablet with star marks
const SIGN = [
  '.bbbbbb.',
  'bWCWWCWb',
  'bWWCWWWb',
  'bWCWWCWb',
  'bWWWCWWb',
  '.bbbbbb.',
  '........',
  '........',
];

// Diamond — recolored per type
const DIAMOND = [
  '...CC...',
  '..CWWC..',
  '.CWWWWC.',
  'CWWWWWWC',
  '.CWWWWC.',
  '..CWWC..',
  '...CC...',
  '........',
];

// Potion flask — recolored per type
const POTION = [
  '...KK...',
  '...EE...',
  '..EEEE..',
  '.EEYYEE.',
  '.EEYYEE.',
  '..EEEE..',
  '........',
  '........',
];

// Page (scroll) — rune color overridden per page
const PAGE = [
  '.WWWWWW.',
  '.WGGGGW.',
  '.WWWWWW.',
  '.WGGGGW.',
  '.WWWWWW.',
  '.WGGGGW.',
  '.WWWWWW.',
  '........',
];

const PRINCESS = [
  '..GGGG..',
  '..SSSS..',
  '.KSSSSK.',
  '..MMMM..',
  '.MMMMMM.',
  'MMMMMMMM',
  '.M....M.',
  '........',
];

// ---- Task 10: SK enemy set — original pixel art (8x8, scale x2) ----

// Goblin — green hunched creature, big ears, yellow eyes
const GOBLIN_0 = [
  '.E....E.',
  '.EE..EE.',
  '.EEEEEE.',
  '.EYEEYE.',
  '.EEeeEE.',
  '..EEEE..',
  '.EE..EE.',
  '.E....E.',
];
const GOBLIN_1 = [
  '.E....E.',
  '.EE..EE.',
  '.EEEEEE.',
  '.EYEEYE.',
  '.EEeeEE.',
  '..EEEE..',
  '..EEEE..',
  '.EE..EE.',
];

// Saramandor — orange fire lizard with long snout
const SARAMANDOR_0 = [
  '........',
  '..OO....',
  '.OYOO...',
  'OOOOOOO.',
  '.oOOOOOO',
  '..OOOOo.',
  '..O..O..',
  '.OO..OO.',
];
const SARAMANDOR_1 = [
  '........',
  '..OO....',
  '.OYOO...',
  'OOOOOOO.',
  '.oOOOOOO',
  '..OOOOo.',
  '...OO...',
  '..O..O..',
];

// Demonhead — red flying horned head
const DEMONHEAD_0 = [
  'R..RR..R',
  '.RRRRRR.',
  'RRRRRRRR',
  'RYRRRRYR',
  'RRRRRRRR',
  '.RWWWWR.',
  '..RRRR..',
  '........',
];
const DEMONHEAD_1 = [
  'R..RR..R',
  '.RRRRRR.',
  'RRRRRRRR',
  'RYRRRRYR',
  'RRRRRRRR',
  '.RWKKWR.',
  '..RRRR..',
  '........',
];

// Ghost — pale floating sheet, passes through blocks
const GHOST_0 = [
  '..WWWW..',
  '.WWWWWW.',
  '.WKWWKW.',
  '.WWWWWW.',
  '.WWWWWW.',
  '.WWWWWW.',
  '.WW.WWW.',
  '.W..W.W.',
];
const GHOST_1 = [
  '..WWWW..',
  '.WWWWWW.',
  '.WKWWKW.',
  '.WWWWWW.',
  '.WWWWWW.',
  '.WWWWWW.',
  '.WWW.WW.',
  '.W.W..W.',
];

// Gargoyle — grey stone winged statue, gold eyes
const GARG_ENEMY_0 = [
  'w..ww..w',
  'ww.ww.ww',
  '.wwwwww.',
  '.wGwwGw.',
  '.wwwwww.',
  '..wwww..',
  '..w..w..',
  '.ww..ww.',
];
const GARG_ENEMY_1 = [
  'w..ww..w',
  '.w.ww.w.',
  '.wwwwww.',
  '.wGwwGw.',
  '.wwwwww.',
  '..wwww..',
  '..w..w..',
  '.ww..ww.',
];

// Wizard — rival mage in purple robe and hat
const WIZARD_0 = [
  '..pppp..',
  '.pppppp.',
  '..SSSS..',
  '.PSKKSP.',
  '.PPPPPP.',
  '.PPGPPP.',
  '..PPPP..',
  '..P..P..',
];
const WIZARD_1 = [
  '..pppp..',
  '.pppppp.',
  '..SSSS..',
  '.PSKKSP.',
  'PPPPPPPP',
  '.PPGPPP.',
  '..PPPP..',
  '.P....P.',
];

const THEME_BRICK_COLORS: Record<number, { A: string; a: string }> = {
  1: { A: '#4070c0', a: '#284884' }, // blue brick
  2: { A: '#9898a8', a: '#5c5c6c' }, // grey brick
  3: { A: '#d8b878', a: '#8c6c38' }, // sandstone
};

/** Border/frame tile textures per wall theme (0 dark stone, 1 blue, 2 grey, 3 sandstone). */
export function makeThemeTiles(scene: Phaser.Scene, theme: number): string {
  const key = `border-t${theme}`;
  if (theme === 0) {
    drawMap(scene, key, DARK_STONE);
  } else {
    const c = THEME_BRICK_COLORS[theme] ?? THEME_BRICK_COLORS[1];
    drawMap(scene, key, BRICK, 2, { ...COLORS, ...c });
  }
  return key;
}

// Life heart icon (small, for HUD — 6x5 displayed as 12x10 with scale 2)
const HEART_HUD = [
  '.R.R.',
  'RRRRR',
  'RRRRR',
  '.RRR.',
  '..R..',
];

export function makeTextures(scene: Phaser.Scene) {
  drawMap(scene, 'dana-idle', DANA_IDLE);
  drawMap(scene, 'dana-walk', DANA_WALK);
  drawMap(scene, 'dana-duck', DANA_DUCK);
  drawMap(scene, 'dana-cast', DANA_CAST);
  drawMap(scene, 'imp-0',        IMP);
  drawMap(scene, 'imp-1',        IMP2);
  drawMap(scene, 'bat-0',        BAT);
  drawMap(scene, 'bat-1',        BAT2);
  drawMap(scene, 'skull-0',      SKULL);
  drawMap(scene, 'skull-1',      SKULL2);
  drawMap(scene, 'phantom-0',    PHANTOM);
  drawMap(scene, 'phantom-1',    PHANTOM2);
  drawMap(scene, 'gargoyle-0',   GARG_ENEMY_0);
  drawMap(scene, 'gargoyle-1',   GARG_ENEMY_1);
  // SK enemy set — original pixel art (Task 10)
  drawMap(scene, 'goblin-0',     GOBLIN_0);
  drawMap(scene, 'goblin-1',     GOBLIN_1);
  drawMap(scene, 'saramandor-0', SARAMANDOR_0);
  drawMap(scene, 'saramandor-1', SARAMANDOR_1);
  drawMap(scene, 'demonhead-0',  DEMONHEAD_0);
  drawMap(scene, 'demonhead-1',  DEMONHEAD_1);
  drawMap(scene, 'ghost-0',      GHOST_0, 2, { ...COLORS, W: '#cfe0f4' });
  drawMap(scene, 'ghost-1',      GHOST_1, 2, { ...COLORS, W: '#cfe0f4' });
  drawMap(scene, 'wizard-0',     WIZARD_0);
  drawMap(scene, 'wizard-1',     WIZARD_1);
  drawMap(scene, 'fireball',     FIREBALL);
  drawMap(scene, 'shot',         SHOT);
  drawMap(scene, 'item-key',     KEY_SPR);
  drawMap(scene, 'item-coin',    COIN);
  drawMap(scene, 'item-gem',     GEM);
  drawMap(scene, 'item-chest',   CHEST);
  drawMap(scene, 'item-life',    LIFE);
  drawMap(scene, 'item-time',    TIME_SPR);
  drawMap(scene, 'item-fire',    FIRE_UP);
  drawMap(scene, 'item-seal',    SEAL);
  drawMap(scene, 'item-crown',   CROWN);
  drawMap(scene, 'item-orb',     ORB);
  // Task 10 — item set (every ItemType gets `item-<type>`)
  drawMap(scene, 'item-bell',            BELL);
  drawMap(scene, 'item-fairy',           FAIRY);
  drawMap(scene, 'item-jarBlue',         JAR);
  drawMap(scene, 'item-jarOrange',       JAR, 2, { ...COLORS, C: COLORS.O, B: COLORS.o });
  drawMap(scene, 'item-jarUpgrade',      JAR, 2, { ...COLORS, C: COLORS.G, B: COLORS.P });
  drawMap(scene, 'item-crystalBlue',     CRYSTAL);
  drawMap(scene, 'item-crystalOrange',   CRYSTAL, 2, { ...COLORS, C: COLORS.O });
  drawMap(scene, 'item-medEdlem',        MEDICINE);
  drawMap(scene, 'item-medMeltona',      MEDICINE, 2, { ...COLORS, R: COLORS.P });
  drawMap(scene, 'item-hourglass',       TIME_SPR);
  drawMap(scene, 'item-hourglassBlue',   TIME_SPR, 2, { ...COLORS, G: COLORS.C, W: '#a8c8e8', w: '#5878a8' });
  drawMap(scene, 'item-wings',           WINGS);
  drawMap(scene, 'item-sealSolomon',     SEAL_SOLOMON);
  drawMap(scene, 'item-sealConstellation', SEAL);
  drawMap(scene, 'item-signConstellation', SIGN);
  drawMap(scene, 'item-jewel',           GEM, 2, { ...COLORS, E: COLORS.M, e: COLORS.p });
  drawMap(scene, 'item-diamondBlue',     DIAMOND);
  drawMap(scene, 'item-diamondOrange',   DIAMOND, 2, { ...COLORS, C: COLORS.O });
  drawMap(scene, 'item-potionX2',        POTION);
  drawMap(scene, 'item-potionX5',        POTION, 2, { ...COLORS, E: COLORS.G, Y: COLORS.W });
  drawMap(scene, 'item-pageTime',        PAGE);
  drawMap(scene, 'item-pageSpace',       PAGE, 2, { ...COLORS, G: COLORS.P });
  drawMap(scene, 'item-princess',        PRINCESS);
  // Tiles + theme frames
  drawMap(scene, 'tile-stone',   STONE);
  drawMap(scene, 'tile-wall',    WALL_MAIN);
  drawMap(scene, 'tile-wall-white', WALL_MAIN, 2, { ...COLORS, T: '#e8e8f0', t: '#9a9ab0', U: '#ffffff' });
  for (let t = 0; t < 4; t++) makeThemeTiles(scene, t);
  drawMap(scene, 'deco-gargoyle', GARGOYLE_STATUE);
  drawMap(scene, 'tile-magic',   MAGIC);
  drawMap(scene, 'door-closed',  DOOR_CLOSED);
  drawMap(scene, 'door-open',    DOOR_OPEN);
  drawMap(scene, 'portal',       PORTAL);
  drawMap(scene, 'spark',        SPARK);
  drawMap(scene, 'sparkle',      SPARKLE);
  drawMap(scene, 'hud-heart',    HEART_HUD, 2);

  // Particle pixels
  makeParticle(scene, 'px-gold',    '#ffc83c', 3);
  makeParticle(scene, 'px-yellow',  '#ffe89a', 3);
  makeParticle(scene, 'px-orange',  '#ff7f27', 3);
  makeParticle(scene, 'px-purple',  '#8c4bd9', 3);
  makeParticle(scene, 'px-red',     '#e23b3b', 3);
  makeParticle(scene, 'px-cyan',    '#59d9e6', 3);
  makeParticle(scene, 'px-white',   '#f4f4f4', 3);
  makeParticle(scene, 'px-green',   '#2ecc71', 3);
  makeParticle(scene, 'px-magenta', '#d957d9', 3);
  makeParticle(scene, 'px-amber',   '#d4a848', 3);

  // Boss sprites — recolored, 4× scale (32×32)
  const bossPal = (over: Record<string, string>) => ({ ...COLORS, ...over });
  drawMap(scene, 'boss-flame',     SKULL,    4, bossPal({ W: COLORS.O, K: COLORS.Y }));
  drawMap(scene, 'boss-colossus',  GARGOYLE, 4, bossPal({ b: COLORS.w }));
  drawMap(scene, 'boss-serpent',   PHANTOM,  4, bossPal({ C: COLORS.P }));
  drawMap(scene, 'boss-celestial', BAT,      4, bossPal({ M: COLORS.C }));
  drawMap(scene, 'boss-king',      IMP,      4, bossPal({ E: '#c060ff', e: '#8020dd' }));

  if (!scene.anims.exists('dana-run')) {
    scene.anims.create({
      key: 'dana-run',
      frames: [{ key: 'dana-idle' }, { key: 'dana-walk' }],
      frameRate: 8,
      repeat: -1,
    });
    for (const e of ['goblin', 'saramandor', 'demonhead', 'ghost', 'gargoyle', 'wizard']) {
      scene.anims.create({
        key: `${e}-anim`,
        frames: [{ key: `${e}-0` }, { key: `${e}-1` }],
        frameRate: 6,
        repeat: -1,
      });
    }
  }
}
