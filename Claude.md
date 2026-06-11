Project Name
Mystic Key

A modern browser-based puzzle-platform arcade game heavily inspired by classic 1980s magical puzzle games.

The game must run perfectly on:

Desktop browsers

Android browsers

iPhone Safari

Tablets

Deployment targets:

Vercel

Netlify

Cloudflare Pages

No backend required.

Tech Stack
Use:

Next.js 15

TypeScript

Phaser 3

Zustand

TailwindCSS

LocalStorage Save System

PWA Support

The entire game must run client-side.

No server.

No database.

Core Gameplay
Player controls a wizard named Dana.

Goal:

Find the key

Reach the exit door

Complete all stages before timer expires

Core mechanics:

Movement
Run left/right

Jump

Double jump disabled

Wall sliding disabled

Magic
Player can:

Create block

Destroy block

Shoot fireball

Block creation:

Only adjacent tile

Cannot create inside enemy

Cannot create inside player

Block destruction:

Destroy adjacent magic blocks

Animation required

Fireballs
Limited range

Destroy most enemies

Upgrade items increase power

Difficulty Philosophy
Easy to learn.

Extremely difficult to master.

Every level must have:

Obvious path

Hidden path

Faster path

Secret item

Camera
Single-screen rooms.

No scrolling.

Arcade style.

Resolution:

320x240 virtual resolution.

Scale to fit device.

Pixel perfect.

Game Structure
64 total stages.

Zodiac Worlds
12 worlds.

Each world contains 4 stages.

Worlds:

Aries

Taurus

Gemini

Cancer

Leo

Virgo

Libra

Scorpio

Sagittarius

Capricorn

Aquarius

Pisces

48 standard levels total.

Secret Levels
15 secret stages.

Hidden entrances.

Require discovering secret seals.

Final Stage
World:

Solomon Chamber

Final boss encounter.

Level Design Rules
Grid Size:

15 x 13

Tile Size:

24x24

Allowed tiles:

Solid Stone

Breakable Magic Block

Spawn Tile

Key Tile

Door Tile

Secret Tile

Item Tile

Every level must be solvable.

Automatic validation system required.

Enemy System
Enemy Types:

Imp
Slow.

Moves horizontally.

Demon Bat
Flying enemy.

Tracks player.

Fire Skull
Shoots projectiles.

Phantom
Moves through blocks.

Gargoyle
Boss-type enemy.

High health.

Enemy Spawn System
Unlimited spawning.

Spawn portals.

Rules:

Maximum active enemies

Spawn cooldown

Difficulty scaling

Items
Basic
Coin

Gem

Treasure Chest

Utility
Extra Life

Time Extension

Fire Upgrade

Rare
Seal Fragment

Hidden Crown

Secret Orb

Secret System
Each world contains:

Hidden seal

Hidden room

Hidden item puzzle

Collecting all seals unlocks:

Page of Time

Page of Space

Princess Chamber

Bosses
One boss every 3 worlds.

Bosses:

Flame Guardian

Stone Colossus

Shadow Serpent

Celestial Demon

Final Boss:

King of Darkness

Multiple phases.

Scoring System
Points from:

Time remaining

Enemies defeated

Secrets found

Items collected

End screen shows:

GDV Score

Formula:

GDV =
Levels +
Secrets +
Items +
Time +
Score

Grade:

D
C
B
A
S
SS

Lives System
Starting lives:

3

Extra lives obtainable.

Game Over screen required.

Continue system:

3 continues.

Mobile Controls
Required.

Left side:

Virtual D-Pad

Right side:

Jump

Create Block

Destroy Block

Fireball

Features:

Touch optimized

Responsive

Haptic feedback support

Multi-touch support

Accessibility
Options Menu:

Sound Volume

Music Volume

Pixel Scale

High Contrast Mode

Remap Controls

Mobile UI Scale

Save System
Use LocalStorage.

Save:

Progress

Scores

Secrets

Settings

Autosave after each level.

Audio
Retro arcade style.

Required:

Menu Theme

World Theme

Boss Theme

Victory Theme

Game Over Theme

Sound effects:

Jump

Block Create

Block Break

Fireball

Key Pickup

Door Open

Damage

Death

Visual Style
16-bit pixel art.

Inspired by:

Arcade classics

Fantasy magic themes

Ancient temples

Zodiac constellations

Palette:

Dark blue

Gold

Orange

Purple

Emerald

UI Screens
Required screens:

Splash Screen

Main Menu

Save Select

Settings

World Map

Level Intro

Gameplay

Pause Menu

Level Complete

Secret Found

Game Over

Credits

Performance
Must maintain:

60 FPS

On:

Mid-range Android phones

iPhone devices

Desktop browsers

Target bundle:

Under 20MB.

PWA Requirements
Installable.

Offline support.

Manifest.

Service worker.

Fullscreen support.

Landscape preferred.

Deployment
Must deploy without modifications to:

Vercel

Netlify

Cloudflare Pages

Build command:

npm run build

Start command:

npm run start

Folder Structure
src/

game/
scenes/
entities/
systems/
levels/
ui/
audio/
assets/

components/

stores/

hooks/

types/

utils/

Development Phases
Phase 1:
Core engine

Phase 2:
Player mechanics

Phase 3:
Block system

Phase 4:
Enemies

Phase 5:
Items

Phase 6:
48 zodiac stages

Phase 7:
15 secret stages

Phase 8:
Bosses

Phase 9:
Mobile controls

Phase 10:
Audio

Phase 11:
Save system

Phase 12:
PWA

Phase 13:
Optimization

Phase 14:
Release candidate

Success Criteria
The finished game must:

Be fully playable

Include all 64 stages

Include secret levels

Work on mobile

Work on desktop

Save progress

Run at 60 FPS

Be deployable to Vercel without backend

Feel like a modern spiritual successor to classic magical puzzle arcade games
