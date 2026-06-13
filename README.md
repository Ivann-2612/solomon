# soli — Mystic Key

A modern browser-based puzzle-platform arcade game inspired by classic 1980s magical puzzle games. Built per `Claude.md` spec.

## Tech

Next.js 15 · TypeScript · Phaser 3 · Zustand · TailwindCSS · LocalStorage saves · PWA. 100% client-side, no backend.

## Run

```bash
npm install
npm run dev        # development
npm run build      # static export to out/
npm run start      # serve the production build
npm run validate-levels  # automatic solvability check for all 64 stages
```

## Deploy

Static export (`out/`) deploys unmodified to **Vercel**, **Netlify** and **Cloudflare Pages**. Build command `npm run build`, output directory `out`.

## Game

- Wizard **Dana**: run, jump, create/destroy magic blocks, fireballs (upgradeable)
- **64 stages**: 12 zodiac worlds × 4 + 15 secret stages + Solomon Chamber
- Find the key → reach the door → beat the timer
- Enemies: Imp, Demon Bat, Fire Skull, Phantom, Gargoyle + spawn portals
- Bosses every 3 worlds: Flame Guardian, Stone Colossus, Shadow Serpent, Celestial Demon, and the multi-phase **King of Darkness**
- Secrets: hidden seals, hidden rooms, hidden item puzzles; 12 seals unlock the Pages of Time/Space and the Princess Chamber ending
- GDV score (Levels + Secrets + Items + Time + Score) with grades D–SS
- 3 lives, 3 continues, autosave to LocalStorage (3 slots)
- Touch controls (D-pad + 4 buttons, haptics), remappable keyboard, high contrast, PWA/offline, installable

Default keys: arrows/WASD move, Space/Z jump, X create block, C destroy block, V fireball, Esc pause.

Note: the playfield is a 15×13 grid of 24px tiles (360×336 virtual canvas incl. HUD) — the closest pixel-perfect fit to the spec's nominal 320×240; it scales to fit any device.
