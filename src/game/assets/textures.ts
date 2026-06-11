import Phaser from 'phaser';
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

/* ---------------- 8x8 entity sprites (scaled x2 -> 16x16) ---------------- */

const DANA_IDLE = [
  '..GGGG..',
  '.GPPPPG.',
  '..SSSS..',
  '..SKSK..',
  '.PPPPPP.',
  'GPPPPPPG',
  '..PPPP..',
  '..P..P..'
];
const DANA_WALK = [
  '..GGGG..',
  '.GPPPPG.',
  '..SSSS..',
  '..SKSK..',
  '.PPPPPP.',
  'GPPPPPPG',
  '..PPPP..',
  '.P....P.'
];
const DANA_CAST = [
  '..GGGG..',
  '.GPPPPG.',
  '..SSSS..',
  '..SKSK..',
  '.PPPPPGG',
  'GPPPPPP.',
  '..PPPP..',
  '..P..P..'
];

const IMP = [
  '.R....R.',
  '.RR..RR.',
  '..RRRR..',
  '.RKRRKR.',
  '..RRRR..',
  '..RRRR..',
  '.R.RR.R.',
  '.R....R.'
];
const IMP2 = [
  '.R....R.',
  '.RR..RR.',
  '..RRRR..',
  '.RKRRKR.',
  '..RRRR..',
  '..RRRR..',
  '..RRRR..',
  '.R....R.'
];

const BAT = [
  'M......M',
  'MM....MM',
  'MMMMMMMM',
  '.MMKKMM.',
  '..MMMM..',
  '..M..M..',
  '........',
  '........'
];
const BAT2 = [
  '........',
  'M......M',
  'MMMMMMMM',
  '.MMKKMM.',
  'MMMMMMMM',
  'M.M..M.M',
  '........',
  '........'
];

const SKULL = [
  '.WWWWWW.',
  'WWWWWWWW',
  'WKWWWWKW',
  'WWWWWWWW',
  '.WWWWWW.',
  '.W.WW.W.',
  '..WWWW..',
  '...WW...'
];
const SKULL2 = [
  '.WWWWWW.',
  'WWWWWWWW',
  'WKWWWWKW',
  'WWWWWWWW',
  '.WWWWWW.',
  '.W.WW.W.',
  '.OWWWWO.',
  '..OWWO..'
];

const PHANTOM = [
  '..CCCC..',
  '.CCCCCC.',
  '.CKCCKC.',
  '.CCCCCC.',
  '.CCCCCC.',
  '.CCCCCC.',
  '.C.CC.C.',
  '........'
];
const PHANTOM2 = [
  '..CCCC..',
  '.CCCCCC.',
  '.CKCCKC.',
  '.CCCCCC.',
  '.CCCCCC.',
  '.CCCCCC.',
  '..C..C..',
  '.C.CC.C.'
];

const GARGOYLE = [
  'b......b',
  'bb.bb.bb',
  '.bbbbbb.',
  '.bKbbKb.',
  '.bbbbbb.',
  '..bbbb..',
  '.b.bb.b.',
  '.b....b.'
];
const GARGOYLE2 = [
  'b......b',
  '.b.bb.b.',
  '.bbbbbb.',
  '.bKbbKb.',
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

/* ---------------- 8x8 items ---------------- */

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
  '.GYGGYG.',
  '.GYGGYG.',
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
  'W..K...W',
  'W..KK..W',
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

/* ---------------- 12x12 tiles (scaled x2 -> 24x24) ---------------- */

const STONE = [
  'wwwwwKwwwwww',
  'wbbbbKbbbbbw',
  'wbbbbKbbbbbw',
  'KKKKKKKKKKKK',
  'bbKbbbbbbKbb',
  'bbKbbbbbbKbb',
  'KKKKKKKKKKKK',
  'wbbbbKbbbbbw',
  'wbbbbKbbbbbw',
  'KKKKKKKKKKKK',
  'bKbbbbbbbbKb',
  'bKbbbbbbbbKb'
];

const MAGIC = [
  'PPPPPPPPPPPP',
  'PpppppppppGP',
  'PpPPPPPPPpPP',
  'PpP.....GpPP',
  'PpP..G..GpPP',
  'PpP.GYG.GpPP',
  'PpP..G..GpPP',
  'PpP.....GpPP',
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
  'M.M.M..M.M.M',
  'M.M.M..M.M.M',
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

  // bosses: recolored, larger versions of base monsters
  const bossPal = (over: Record<string, string>) => ({ ...COLORS, ...over });
  drawMap(scene, 'boss-flame', SKULL, 4, bossPal({ W: COLORS.O, K: COLORS.Y }));
  drawMap(scene, 'boss-colossus', GARGOYLE, 4, bossPal({ b: COLORS.w }));
  drawMap(scene, 'boss-serpent', PHANTOM, 4, bossPal({ C: COLORS.P }));
  drawMap(scene, 'boss-celestial', BAT, 4, bossPal({ M: COLORS.C }));
  drawMap(scene, 'boss-king', IMP, 4, bossPal({ R: COLORS.p, K: COLORS.G }));

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
