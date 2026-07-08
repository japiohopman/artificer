# 🛠️ DM Kit (Dev Kit) Documentation

## Overview
The **DM Kit** (or Dev Kit) is a critical component of the Artificer project, providing Dungeon Masters and developers with the tools necessary to manifest, test, and manage the game world and its entities. It is as vital as the game client itself.

## Organizational Vision
To ensure clarity and ease of use, the DM Kit UI is organized into logical functional groups.

### 1. Primary Inspectors
These tools allow for the direct inspection and editing of the game's core "Reality" (Atlas data) and current "State" (World flags).
- **Codex Explorer**: Inspect and manage the global asset repository (Enemies, Equipment, Materials).
- **World Explorer**: Direct interface for regional and location-based data.
- **Flag Manager**: Monitor and modify global world flags and faction standings.

### 2. Entity Generators
Grouped under a single management tab, these tools handle the procedural and AI-driven creation of game objects.
- **NPC Generator**: High-fidelity character creation with AI lore and image synthesis.
- **Enemy Manifestation**: Parse raw monster stats (e.g., from 5e.tools) into valid Atlas entities.
- **Habitat Generator**: Create and commit atmospheric environmental backgrounds.

### 3. Validation Testers
Grouped under a single testing tab, these tools ensure that game mechanics and entity interactions function correctly.
- **Combat Tester**: Simulate tactical encounters on the grid.
- **NPC Slot Tester**: Verify character store synchronization and party slot management.
- **Simulator**: Test item interactions and character sheet calculations.

## Maintenance & Upgrades
The DM Kit requires regular maintenance to ensure its utility:
- **NPC Generator**: Ensure the generation pipeline (Choice Resolver, Pipeline) remains synchronized with the latest `saveVersion` and character store schema.
- **Functional Reliability**: Regularly verify that testers accurately reflect game logic (e.g., AC calculation, movement rules).
- **Cleanup**: Periodically audit the toolkit to remove redundant logic and ensure all tools consume data from the canonical Atlas paths.

## Integration
The DM Kit is implemented in `src/components/devkit/DevKit.tsx` and utilizes services like `npcService.ts`, `imageService.ts`, and `storageService.ts` to interact with the repository and AI models.
