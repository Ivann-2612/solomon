// Automatic level validation: `npm run validate-levels`
import { validateAllLevels, getLevel } from '../src/game/levels/generator';

const results = validateAllLevels();
const bad = results.filter((r) => !r.ok);
for (const r of results) {
  const lvl = getLevel(r.id);
  console.log(
    `#${String(r.id).padStart(2, '0')} ${lvl.name.padEnd(16)} ${r.ok ? 'OK' : 'FAIL ' + r.reason} ` +
      `(items:${lvl.items.length} enemies:${lvl.enemies.length} portals:${lvl.portals.length}${lvl.boss ? ' BOSS:' + lvl.boss : ''})`
  );
}
console.log(`\n${results.length - bad.length}/${results.length} levels valid`);
if (bad.length) process.exit(1);
