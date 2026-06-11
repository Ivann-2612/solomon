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

/* ---- Entity sprites 8x8 (scale x2 = 16x16) ---- */

const DANA_IDLE = [
  '..GYYG..',
  '.GGGGGG.',
  '..SSSS..',
  '..SKSK..',
  '.PPPPPP.',
  'GPPPPPPG',
  '..PPPP..',
  '..P..P..'
];
const DANA_WALK = [
  '..GYYG..',
  '.GGGGGG.',
  '..SSSS..',
  '..SKSK..',
  '.PPPPPP.',
  'GPPPPPPG',
  '..PPPP..',
  '.P....P.'
];
const DANA_CAST = [
  '..GYYG..',
  '.GGGGGG.',
  '..SSSS..',
  '..SKSK..',
  '.PPPPPP.',
  'GPPPPGGG',
  '..PPPP..',
  '..P..P..'
];

const IMP = [
  '.R....R.',
  '.RR..RR.',
  '..RRRR..',
  '.RYRRYR.',
  '..RRRR..',
  '.RRGRRR.',
  '.R.RR.R.',
  '.R....R.'
];
const IMP2 = [
  '.R....R.',
  '.RR..RR.',
  '..RRRR..',
  '.RYRRYR.',
  '..RRRR..',
  '.RRGRRR.',
  '..RRRR..',
  '.R....R.'
];

const BAT = [
  'M......M',
  'MM....MM',
  'MMMMMMMM',
  '.MMYYMM.',
  '..MMMM..',
  '..M..M..',
  '........',
  '........'
];
const BAT2 = [
  '........',
  '.M....M.',
  'MMMMMMMM',
  '.MMYYMM.',
  'MMMMMMMM',
  'M.M..M.M',
  '........',
  '........'
];

const SKULL = [
  '.WWWWWW.',
  'WWWWWWWW',
  'WKWwwwKW',
  'WWwwwwWW',
  '.WWWWWW.',
  '.W.WW.W.',
  '..OOOO..',
  '...OO...'
];
const SKULL2 = [
  '.WWWWWW.',
  'WWWWWWWW',
  'WKWwwwKW',
  'WWwwwwWW',
  '.WWWWWW.',
  '.W.WW.W.',
  '.OWWWWO.',
  '..OWWO..'
];

const PHANTOM = [
  '..CCCC..',
  '.CWWWWC.',
  '.CKWWKC.',
  '.CWWWWC.',
  '.CCCCCC.',
  '.CcCcCC.',
  '.C.CC.C.',
  '........'
];
const PHANTOM2 = [
  '..CCCC..',
  '.CWWWWC.',
  '.CKWWKC.',
  '.CWWWWC.',
  '.CCCCCC.',
  '.CcCcCC.',
  '..C..C..',
  '.C.CC.C.'
];

const GARGOYLE = [
  'b......b',
  'bb.bb.bb',
  '.bbbbbb.',
  '.bYbbYb.',
  '.bbbbbb.',
  '..bbbb..',
  '.b.bb.b.',
  '.b....b.'
];
const GARGOYLE2 = [
  'b......b',
  '.b.bb.b.',
  '.bbbbbb.',
  '.bYbbYb.',
  '.bbbbbb.',
  '..bbbb..',
  '.b.bb.b.',
  'b......b'
];

const FIREBALL = [
  '...GG...',
  '..GOOG..',
  '.GOOOOG.',
  '.GOOYOG.',
  '..GOOG..',
  '...GG...'
];

const SHOT = ['.RR.', 'ROOR', 'ROOR', '.RR.'];

/* ---- Items 8x8 (scale x2 = 16x16) ---- */

const KEY_SPR = [
  '.GGG....',
  'G...G...',
  'G...G...',
  '.GGG....',
  '..G.....',
  '..GGG...',
  '..G.....',
  '..GG....'
];
const COIN = [
  '..GGGG..',
  '.GYYYYG.',
  '.GYoGYG.',
  '.GYGGpG.',
  '.GYYYYG.',
  '..GGGG..'
];
const GEM = [
  '..EEEE..',
  '.EeEEeE.',
  'EEEEEEEE',
  '.EEEEEE.',
  '..EEEE..',
  '...EE...'
];
const CHEST = [
  '.oooooo.',
  'oGGGGGGo',
  'oooooooo',
  'oGGoGGGo',
  'oGGGGGGo',
  '.oooooo.'
];
const LIFE = [
  '.RR..RR.',
  'RRRRRRRR',
  'RRRRRRRR',
  '.RRRRRR.',
  '..RRRR..',
  '...RR...'
];
const TIME_SPR = [
  '..WWWW..',
  '.W....W.',
  'W..G...W',
  'W..GG..W',
  '.W....W.',
  '..WWWW..'
];
const FIRE_UP = [
  '...O....',
  '..OO....',
  '.OOOO...',
  '.OYYO...',
  'OOYYOO..',
  '.OOOO...'
];
const SEAL = [
  '..PPPP..',
  '.PGGGGP.',
  'PG.GG.GP',
  'PG.GG.GP',
  '.PGGGGP.',
  '..PPPP..'
];
const CROWN = [
  'G..G..G.',
  'GG.GG.GG',
  'GGGGGGGG',
  'GYGYGYGG',
  'GGGGGGGG',
  '........'
];
const ORB = [
  '..CCCC..',
  '.CWWWWC.',
  'CWWCCWWC',
  'CWWCCWWC',
  '.CWWWWC.',
  '..CCCC..'
];

/* ---- Tiles 12x12 (scale x2 = 24x24) ---- */

const STONE = [
  'wwwwwKwwwwww',
  'wbbbbKbbbbbw',
  'wbWbbKbbWbbw',
  'KKKKKKKKKKKK',
  'bbKbbbbbbKbb',
  'bbKbWbbbbKbb',
  'KKKKKKKKKKKK',
  'wbbbbKbbbbbw',
  'wbbWbKbbbbbw',
  'KKKKKKKKKKKK',
  'bKbbbbbbbbKb',
  'bKbbbbbbbbKb'
];

const MAGIC = [
  'PPPPPPPPPPPP',
  'PpppppppppGP',
  'PpPPPPPPPpPP',
  'PpP..WW.GpPP',
  'PpP.WYGW.pPP',
  'PpPWYGGYWpPP',
  'PpP.WYGW.pPP',
  'PpP..WW.GpPP',
  'PpPGGGGGGpPP',
  'PpppppppppPP',
  'PPPPPPPPPPPP',
  'pppppppppppp'
];

const DOOR_CLOSED = [
  '..pppppppp..',
  '.pPPPPPPPPp.',
  'pPPpppppppPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pPpDDGGDDpPp',
  'pPpDDGGDDpPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pPpDDDDDDpPp',
  'pppppppppppp'
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
  'pppppppppppp'
];

const PORTAL = [
  '....MMMM....',
  '..MM....MM..',
  '.M..MMMM..M.',
  'M..M....M..M',
  'M.M..MM..M.M',
  'M.M.MYYM.M.M',
  'M.M.MYYM.M.M',
  'M.M..MM..M.M',
  'M..M....M..M',
  '.M..MMMM..M.',
  '..MM....MM..',
  '....MMMM....'
];

const SPARK = ['.Y.', 'YGY', '.Y.'];

export function makeTextures(scene: Phaser.Scene) {
  drawMap(scene, 'dana-idle', DANA_IDLE);
  drawMap(scene, 'dana-walk', DANA_WALK);
  drawMap(scene, 'dana-cast', DANA_CAST);
  drawMap(scene, 'imp-0', IMP);
  drawMap(scene, 'imp-1', IMP2);
  drawMap(scene, 'bat-0', BAT);
  drawMap(scene, 'bat-1', BAT2);
  drawMap(scene, 'skull-0', SKULL);
  drawMap(scene, 'skull-1', SKULL2);
  drawMap(scene, 'phantom-0', PHANTOM);
  drawMap(scene, 'phantom-1', PHANTOM2);
  drawMap(scene, 'gargoyle-0', GARGOYLE);
  drawMap(scene, 'gargoyle-1', GARGOYLE2);
  drawMap(scene, 'fireball', FIREBALL);
  drawMap(scene, 'shot', SHOT);
  drawMap(scene, 'item-key', KEY_SPR);
  drawMap(scene, 'item-coin', COIN);
  drawMap(scene, 'item-gem', GEM);
  drawMap(scene, 'item-chest', CHEST);
  drawMap(scene, 'item-life', LIFE);
  drawMap(scene, 'item-time', TIME_SPR);
  drawMap(scene, 'item-fire', FIRE_UP);
  drawMap(scene, 'item-seal', SEAL);
  drawMap(scene, 'item-crown', CROWN);
  drawMap(scene, 'item-orb', ORB);
  drawMap(scene, 'tile-stone', STONE);
  drawMap(scene, 'tile-magic', MAGIC);
  drawMap(scene, 'door-closed', DOOR_CLOSED);
  drawMap(scene, 'door-open', DOOR_OPEN);
  drawMap(scene, 'portal', PORTAL);
  drawMap(scene, 'spark', SPARK);

  // particle pixels for all effects
  makeParticle(scene, 'px-gold',   '#ffc83c', 3);
  makeParticle(scene, 'px-yellow', '#ffe89a', 3);
  makeParticle(scene, 'px-orange', '#ff7f27', 3);
  makeParticle(scene, 'px-purple', '#8c4bd9', 3);
  makeParticle(scene, 'px-red',    '#e23b3b', 3);
  makeParticle(scene, 'px-cyan',   '#59d9e6', 3);
  makeParticle(scene, 'px-white',  '#f4f4f4', 3);
  makeParticle(scene, 'px-green',  '#2ecc71', 3);
  makeParticle(scene, 'px-magenta','#d957d9', 3);

  // bosses: recolored, larger versions of base monsters
  const bossPal = (over: Record<string, string>) => ({ ...COLORS, ...over });
  drawMap(scene, 'boss-flame',     SKULL,    4, bossPal({ W: COLORS.O, K: COLORS.Y }));
  drawMap(scene, 'boss-colossus',  GARGOYLE, 4, bossPal({ b: COLORS.w }));
  drawMap(scene, 'boss-serpent',   PHANTOM,  4, bossPal({ C: COLORS.P }));
  drawMap(scene, 'boss-celestial', BAT,      4, bossPal({ M: COLORS.C }));
  drawMap(scene, 'boss-king',      IMP,      4, bossPal({ R: COLORS.p, K: COLORS.G }));

  if (!scene.anims.exists('dana-run')) {
    scene.anims.create({
      key: 'dana-run',
      frames: [{ key: 'dana-idle' }, { key: 'dana-walk' }],
      frameRate: 8,
      repeat: -1
    });
    for (const e of ['imp', 'bat', 'skull', 'phantom', 'gargoyle']) {
      scene.anims.create({
        key: `${e}-anim`,
        frames: [{ key: `${e}-0` }, { key: `${e}-1` }],
        frameRate: 6,
        repeat: -1
      });
    }
  }
}
