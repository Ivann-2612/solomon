# Mystic Key — Faithful Classic Remake Design Spec

The game keeps its own name, **Mystic Key**, everywhere (title screen, manifest, package.json, UI). No "Solomon's Key" branding anywhere in the shipped game; the reference is internal documentation only. Personal/private use.

Date: 2026-06-11
Approach: A — transform the existing codebase in place (keep Next.js/Phaser shell, replace mechanics, items, HUD, art, and levels).

## Goal

Turn the current Mystic Key game into a faithful recreation of the 1986 Tecmo arcade game Solomon's Key: same screen flow, mechanics, items, room layouts, scoring, secrets, and endings. Pixel-faithful look recreated by hand (procedural pixel art in `textures.ts`) — no ripped assets.

## Kept from current codebase

- Next.js 15 + TypeScript + Phaser 3 + Zustand + TailwindCSS shell
- LocalStorage save system, PWA, mobile touch controls
- Scene framework (Boot → Splash → Menu → … → Game), 320×240 virtual resolution scaled to fit
- Level validator (adapted to new room format)

## Replaced / added

### 1. Player mechanics (`entities/Player.ts`)
- Run, fixed-height jump, duck. No double jump, no wall slide.
- Block magic: create/destroy orange block on adjacent tile (including diagonal-up, as in the original). Destroying blocks reveals hidden items.
- Head-bump: jumping head-first into an orange block twice destroys it.
- Fireball inventory: start with 0. Blue jar = +1 normal fireball (limited range, rolls along floor). Orange jar = super fireball (crosses whole screen through all enemies). Upgrade jar converts next normal fireball to super.
- Blue crystal: +0.5 tile fireball range; orange crystal: +2 tiles. Range resets on death.
- Instant death on any contact with enemy or projectile. Death restarts the whole room (lives −1).

### 2. Enemies (SK set)
Goblin (patrols ledges), Saramandor (walks, breathes fire toward Dana; drop direction depends on Dana's position), Demon Head (flies straight), Ghost (passes through blocks), Gargoyle statue (shoots projectiles), Wizard (teleports + casts), spawn portals (max active count + cooldown, difficulty scaling).

### 3. Items (`systems/items.ts`)
- Bell → releases fairy from the door; fairy drifts around room; 10 fairies = extra life.
- Jars: blue (normal fireball), orange (super fireball), upgrade.
- Crystals: blue / orange (range).
- Medicine of Edlem: resets Bonus to 50000 (or 25000 if half) and speeds countdown.
- Hourglass of Norm: resets Bonus to 5000; blue variant 10000.
- Medicine of Meltona: temporarily destroys Saramandors and Demon Heads.
- Golden Wings (rooms 7, 15, 23, 31, 39): skip next 5 rooms.
- 8 hidden Solomon's Seals; 12 constellation seals (last room of each constellation) unlocking 12 bonus rooms; constellation signs in every 4th room.
- Score items: coins, jewels, diamonds (blue diamond → normal fireball, orange → super, when transformed by block magic).
- Multiplier potions ×2 / ×5 (multiply Bonus counter and countdown rate).

### 4. Scoring (`systems/scoring.ts`)
- Bonus counter starts at 50000 per room and ticks down (~10 pts/tick); it is both the timer and the end-of-room bonus.
- Score from items, enemies, fairies, remaining Bonus.
- GDV (Game Deviation Value) grade shown on Game Over screen (D/C/B/A/S/SS).
- Extra lives at score thresholds and every 10 fairies.

### 5. Rooms (`levels/rooms/`)
- 64 rooms total: 48 zodiac rooms (12 constellations × 4) + Solomon's Room (49) + 12 bonus rooms + Page of Time + Page of Space + Princess Room.
- Each room: ASCII 15×13 grid (`#` solid stone, `B` orange block, `.` empty, `K` key, `D` door, `S` spawn …), enemy list (type, position, facing), hidden-item map (which block hides what).
- Layouts transcribed faithfully from original maps (GameFAQs walkthrough, VGMaps/StrategyWiki).
- Unlock rules: bonus room = collect constellation seal in 4th room of group; Page of Time = first 4 Solomon's seals + sign in room 20; Page of Space = first 6 seals + sign in room 44; Princess Room = all 8 seals, after room 48.
- Validator checks solvability of every room.

### 6. Endings (4)
Normal / Princess (saved princess) / Pages (both pages) / Best (princess + both pages).

### 7. Screen flow
Splash → Title with attract/demo mode after ~10 s idle (plays recorded inputs, shows -DEMO- in bottom bar) → Start → rooms in order (linear, as original). World map remains only as level select for already-cleared rooms. Level intro card → Gameplay → Game Over with GDV → ending → Credits. 3 continues.

### 8. Visuals
- HUD top: "1P", score, "BONUS" counter. Status bar bottom: "Fairy..N", lives, "-DEMO-" indicator.
- Decorative stone frame around the playfield; wall themes rotate per constellation: dark stone with gargoyle statues / blue brick / grey brick / sand stone (4–6 themes recreated from screenshots).
- Sparkle stars scattered on the background. Orange/tan textured blocks, white breakable blocks where the original uses them.
- All textures procedurally generated in `assets/textures.ts`, faithful to the reference screenshots.

### 9. Save
Autosave: furthest room, seals, fairies, score, lives, settings. Resume after refresh.

## Risks

- Accuracy of 64 transcribed room layouts is the largest work item; transcribe room-by-room with validator + manual playtest per room.
- Exact GDV formula is undocumented; approximate with the documented inputs (levels, secrets, items, time, score) as already specced in CLAUDE.md.

## Out of scope

- Ripped/original Tecmo assets (legal risk for public deploy).
- NES-exclusive extensions beyond the structure listed here.
