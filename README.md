# Dungeon Explorer

> English | [中文版](./README.zh-CN.md)

A 2D isometric pixel-art dungeon crawler RPG built with Phaser 3, TypeScript, and Vite.

## Overview

Dungeon Explorer is a real-time combat RPG featuring:

- **Isometric 2D perspective** — 45° top-down view with depth sorting
- **Two playable classes**: Warrior (melee) and Mage (ranged magic)
- **10 procedurally generated dungeon floors** with increasing difficulty
- **Abyss Mode** — 10% chance to trigger a harder variant with exclusive drops
- **Full RPG systems**: Equipment, enhancement, crafting, identification, inventory, skills, Buffs, and more
- **8 interactive NPCs** in the town hub for trading, upgrades, and progression

## Features

### Core Gameplay

| Feature | Description |
|---------|-------------|
| **Classes** | Warrior, Mage (with 6 specializations at level 20) |
| **Leveling** | 1–60 levels, 5 attribute points per level |
| **Skills** | ~62 skills across both classes, with active and passive abilities |
| **Equipment** | 687+ equipment pieces (weapons, armor, accessories) in 5 rarity tiers |
| **Abyss Gear** | 78 exclusive abyss-level equipment items |
| **Runes** | 5-rarity rune system with stat bonuses |
| **Crafting** | Alchemy recipes for potions and materials |
| **Dungeons** | 10 floors, random room generation, Boss rooms |

### Progression Systems

- **Equipment Enhancement** — +1 to +20 enhancement with success rates and failure penalties
- **Durability & Repair** — Equipment degrades with use, repair at the Blacksmith
- **Disenchantment** — Break down equipment for materials
- **Identification** — Unidentified gear can be identified at the Fortune Teller
- **Warehouse** — Bank storage for items
- **Weapon Mastery** — Passive bonuses for weapon types
- **Death Penalty** — Lose experience, gold, and potentially items on death

### NPCs

| NPC | Location | Function |
|-----|----------|----------|
| Blacksmith | Military Zone | Enhancement, repair, disenchantment |
| Merchant | Commercial Zone | Buy/sell items, daily stock |
| Skill Trainer | Military Zone | Learn and upgrade skills |
| Class Trainer | Military Zone | Class change at level 20 |
| Banker | Adventurer Zone | Warehouse storage |
| Fortune Teller | Commercial Zone | Identify equipment |
| Alchemist | Commercial Zone | Alchemy crafting |
| Teleporter | Central Square | Floor teleportation |

## Controls

| Input | Action |
|-------|--------|
| **Right-click** | Move to target (ground) |
| **Left-click monster** | Select and attack |
| **Left-click NPC** | Interact / dialog |
| **Keys 1–8** | Use skill / item in slot |
| **I** | Toggle inventory |
| **E** | Toggle equipment panel |
| **C** | Toggle character panel |
| **M** | Toggle minimap (in dungeon) |
| **K** | Toggle skill panel |
| **ESC** | Settings / close panel |
| **Space** | Pick up ground item |
| **F** | Interact with nearest object |
| **R** | Rest (regenerate HP/MP) |

## Tech Stack

- **Engine**: Phaser 3.90
- **Language**: TypeScript 6
- **Build Tool**: Vite 8
- **Package Manager**: pnpm 10

## Project Structure

```
2dgame/
├── src/
│   ├── config/          # Types, constants, global config
│   ├── data/            # Static data: classes, skills, equipment, items, monsters, NPCs
│   ├── entities/        # Game entities: Player, Monster, Boss, NPC
│   ├── scenes/          # Phaser scenes: Boot, Preload, MainMenu, Town, Dungeon, UI
│   ├── systems/          # Game logic: Battle, Inventory, Skill, Dungeon, Save, etc.
│   ├── ui/              # UI components: panels, HUD, dialogs
│   ├── map/             # Room & corridor generation
│   ├── state/           # Global game state
│   ├── utils/           # Utilities: isometric math, random, save
│   └── main.ts          # Entry point
├── public/              # Static assets
├── docs/                # Design documents
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Opens the game at `http://localhost:3000`.

### Build for Production

```bash
pnpm build
```

Output in `dist/`.

## Documentation

Detailed design specs are in `docs/`:

- [Game Design](./docs/game-design.md) — Core mechanics, combat, leveling
- [Game Architecture](./docs/game-architecture.md) — Tech stack, modules, data flow
- [Controls](./docs/controls.md) — Full input reference
- [Development Plan](./docs/development-plan.md) — 8-phase development roadmap
- [NPC System](./docs/npc-system.md) — NPC details and services
- [Monster System](./docs/monster-system.md) — Monster types, behavior, skills
- [Equipment System](./docs/equipment-system.md) — Enhancement, durability, sets
- [Attribute Rules](./docs/attribute-rules.md) — Stat allocation formulas

## Development Status

**Phase 1–6 Complete** (Minimum Playable Version achieved):

- Main menu → Character creation → Town → Dungeon exploration
- Real-time combat with monsters and Bosses
- All UI panels (inventory, equipment, skills, shop, enhance, repair, craft, identify, warehouse, save, death, abyss choice)
- Full NPC interaction flow
- Save/load system with multiple slots
- Auto-save every 5 minutes

**Phase 7–8 In Progress**: Visual polish, balance tuning, content expansion.

## License

ISC

---

*Version 1.0.0 — Built with Phaser 3 + TypeScript + Vite*