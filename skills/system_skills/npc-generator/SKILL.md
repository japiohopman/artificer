---
name: npc-generator
description: Provides guidelines for generating rule-abiding NPCs, including ability scores, equipment automation, and XP progression.
---

# NPC Generation Guidelines

This skill provides instructions for generating NPCs that strictly follow D&D 5e rules and the project's data architecture.

## Ability Scores
- **Standard**: Roll 4d6, discard the lowest die, and sum the remaining three for each of the six attributes (STR, DEX, CON, INT, WIS, CHA).
- **NPC Balancing**: Higher priority should be given to stats relevant to the character's class (e.g., INT for Wizards, STR for Barbarians).

## XP and Leveling
NPCs follow the standard 5e XP progression table:
- Level 1: 0 XP
- Level 2: 300 XP
- Level 3: 900 XP
- ... up to Level 20.

## Equipment Automation
NPCs should be equipped based on their class starting equipment definitions found in `public/assets/atlas/class/json/`.

### Starting Equipment Strategy:
1. **Choices**: Classes provide choices (e.g., "(a) a greataxe or (b) any martial melee weapon"). The generator must make a thematic choice.
2. **Packs**: Many classes provide an equipment pack (e.g., Explorer's Pack).
   - If an equipment pack is chosen, its **contents** must be extracted and added to the NPC's backpack.
   - Refer to the individual pack JSON in `public/assets/atlas/equipment/json/` for the list of contents.
3. **Item Data**: Each item must include:
   - `name`: Human-readable name.
   - `index`: Slug identifier.
   - `imageUrl`: Resolved image path.
   - `_type`: "equipment".

## Identity Rules
- **Allowed Races**: Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Human, Tiefling, High Elf, Hill Dwarf, Lightfoot Halfling, Rock Gnome.
- **Backgrounds**: Acolyte, Charlatan, Criminal, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin.

## Visuals
- Portraits must be generated with a **Pure Chroma Green (#00FF00)** background to allow for background removal in-app.
- Prompt should specify a vertical 9:16 aspect ratio for profile portraits.
