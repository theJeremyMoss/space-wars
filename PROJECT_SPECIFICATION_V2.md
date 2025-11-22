# Space Wars V2 - Project Specification

## Overview
A modernized, high-resolution version of the Space Shooter game, combining mechanics from Space Invaders and Galaga. Built with **Phaser 3** and **Vite**, featuring a modular codebase, advanced enemy AI, and dynamic visual effects.

## Technology Stack
- **Framework**: Phaser 3 (Latest)
- **Build Tool**: Vite (for module support and asset management)
- **Language**: JavaScript (ES Modules)
- **Audio**: Web Audio API (Procedural generation, ported from V1)
- **Rendering**: WebGL

## Game Configuration
- **Resolution**: 1024x768 (4:3 Aspect Ratio)
- **Background**: Deep space with multi-layered parallax starfield
- **Physics**: Arcade Physics

## Gameplay Mechanics

### 1. Player
- **Movement**: Smooth acceleration/deceleration (Arrow keys).
- **Weapons**:
    - Primary: Single shot blaster (upgradable).
    - Powerups change weapon type.
- **Lives**: 3 starting lives.

### 2. Enemy System (The Grid)
- **Formation**: A grid of enemies guarding the Death Star.
- **Behavior**:
    - **Idle**: Hover/move in formation (Space Invaders style).
    - **Attack**: Randomly detach and dive-bomb the player (Galaga style).
    - **Respawn**: Destroyed enemies are replaced after a cooldown, flying back into formation to keep the grid full.

### 3. The Death Star (Boss)
- **Position**: Background/Top-Center, guarded by the enemy grid.
- **Vulnerability**:
    - Initially invulnerable (Shielded).
    - **Trigger**: Score > 2000 (increases per level).
    - **Vulnerable State**: Shields down, core exposed.
- **Destruction**:
    - Requires 3 precise hits up the center exhaust port.
    - **Effect**: Massive screen-wiping explosion, destroys all active enemies.
- **Progression**: Destroying the Death Star advances to the next level (increased difficulty).

### 4. Powerups
Dropped by random enemies (glowing/special enemies).
- **Dual Shot**: Two parallel bullets.
- **Spread Shot**: 3-way spread.
- **Shield**: Temporary invulnerability or 1-hit absorption.
- **Speed Up**: Faster movement speed.

## Visual Effects
- **Bloom/Glow**: Neon aesthetic for bullets and engines.
- **Particles**: Rich explosions, thruster trails, debris.
- **Death Star Explosion**: Shockwaves, screen shake, blinding flash.

## Architecture (Multi-file)
- `src/main.js`: Entry point.
- `src/scenes/`: Separate scenes for Boot, Menu, Game, HUD, GameOver.
- `src/entities/`: Classes for Player, Enemy, Boss, Powerup.
- `src/systems/`: Managers for Audio, Waves, Particles.

## Assets
- Reuse existing assets where possible.
- Generate/Create new assets for Powerups and UI elements if needed.
