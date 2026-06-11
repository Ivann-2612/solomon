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

// Dana – wizard with pointed hat, purple robe, gold trim
const DANA_IDLE = [
  '..pppp..',  // hat tip
  '.PPPpPP.',  // hat body
  '.SSSSSS.',  // face
  'KSSoSSKK',  // face detail (o=nostril/dark)
  '.KGGPPK.',  // chest: gold trim + purple robe
  'KPPPPPKK',  // robe body
  '.KPPPPK.',  // lower robe
  '..K..K..',  // legs
];
const DANA_WALK = [
  '..pppp..',
  '.PPPpPP.',
  '.SSSSSS.',
  'KSSoSSKK',
  '.KGGPPK.',
  'KPPPPPKK',
  '.KPP.PK.',
  '.KP...K.',
];
const DANA_CAST = [
  '..pppp..',
  '.PPPpPP.',
  '.SSSSSS.',
  'KSSoSSKK',
  '.KGGPPK.',
  'KPPPGGGG',  // arm extended with gold staff
  '.KPPPPK.',
  '..K..K..',
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

// Stone tile — bright white face so world tint colors it vividly
// K border = dark mortar/grout between tiles
// W = main face (tints to world color)
// w = shadow row at bottom for slight 3-D depth
const STONE = [
  'KKKKKKKKKKKK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KWWWWWWWWWWK',
  'KwwwwwwwwwwK',
  'KKKKKKKKKKKK',
];

// Magic block — amber/sand colored, fixed (NOT tinted), with inner rune
// N=amber bright, n=amber dark, F=amber highlight
// K=outline, G=gold rune, P=purple center, Y=light gold glow
const MAGIC = [
  'KKKKKKKKKKKK',
  'KFNNNNNNNnKK',
  'KFNKKKKKNnKK',
  'KFNKGGGGNnKK',
  'KFNKGPPGNnKK',
  'KFNKGPYGNnKK',
  'KFNKGPPGNnKK',
  'KFNKGGGGNnKK',
  'KFNKKKKKNnKK',
  'KFNNNNNNNnKK',
  'KKKKKKKKKKKK',
  'KKKKKKKKKKnK',
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
  drawMap(scene, 'dana-cast', DANA_CAST);
  drawMap(scene, 'imp-0',        IMP);
  drawMap(scene, 'imp-1',        IMP2);
  drawMap(scene, 'bat-0',        BAT);
  drawMap(scene, 'bat-1',        BAT2);
  drawMap(scene, 'skull-0',      SKULL);
  drawMap(scene, 'skull-1',      SKULL2);
  drawMap(scene, 'phantom-0',    PHANTOM);
  drawMap(scene, 'phantom-1',    PHANTOM2);
  drawMap(scene, 'gargoyle-0',   GARGOYLE);
  drawMap(scene, 'gargoyle-1',   GARGOYLE2);
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
  drawMap(scene, 'tile-stone',   STONE);
  drawMap(scene, 'tile-magic',   MAGIC);
  drawMap(scene, 'door-closed',  DOOR_CLOSED);
  drawMap(scene, 'door-open',    DOOR_OPEN);
  drawMap(scene, 'portal',       PORTAL);
  drawMap(scene, 'spark',        SPARK);
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
    for (const e of ['imp', 'bat', 'skull', 'phantom', 'gargoyle']) {
      scene.anims.create({
        key: `${e}-anim`,
        frames: [{ key: `${e}-0` }, { key: `${e}-1` }],
        frameRate: 6,
        repeat: -1,
      });
    }
  }
}
