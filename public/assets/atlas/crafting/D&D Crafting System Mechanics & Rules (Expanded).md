# D&D Crafting System Mechanics & Rules (Expanded)

This document outlines the core mechanics, rules, and tables for the D&D crafting system, now expanded to incorporate a vast array of materials across all crafting disciplines. It integrates the extensive material database (metals, woods, monster parts, herbs, etc.) into a cohesive, playable system designed for your React-based game.

## 1. Core Crafting Mechanics

The crafting system is built around three primary components: **Base Items**, **Materials**, and **Reagents**.

*   **Base Item:** The mundane template of the item being crafted (e.g., Longsword, Plate Armor, Potion Vial, Blank Scroll).
*   **Primary Material:** The main substance the item is made from (e.g., Adamantine, Blueleaf, Dragonhide, Blueglow Moss). This dictates the item's core properties, durability, and primary game effect.
*   **Secondary Material / Reagent (Optional):** Additional components used to enhance or enchant the item (e.g., Aboleth Mucus, Fairy Dust, Firestone, Basil). These add specific magical, alchemical, or culinary effects.

### 1.1 The Crafting Process

1.  **Gathering/Harvesting:** Players acquire materials through mining, logging, foraging, or harvesting defeated monsters. The expanded material list provides significantly more options for each method.
2.  **Recipe Selection:** The player selects a known recipe or experiments with combinations. Recipes are now categorized by crafting type (Smithing, Alchemy, Cooking, Arcane).
3.  **Skill Check:** The player makes a relevant tool proficiency check (e.g., Smith's Tools, Alchemist's Supplies, Cook's Utensils, Calligrapher's Supplies). The DC is determined by the rarity of the materials and the complexity of the item, as well as the specific crafting discipline.
4.  **Time and Cost:** Crafting takes time (measured in hours or days) and requires a gold cost for mundane supplies (flux, leather straps, vials, spices, inks, etc.). Higher rarity and complexity increase both time and cost.
5.  **Result:** Success yields the crafted item. Failure may result in lost time, ruined materials, a flawed item, or, in arcane crafting, potential magical backlash.

## 2. Material Tiers and Rarity

Materials are categorized by rarity, which directly impacts the crafting DC, time required, and the power of the resulting item. The expanded database now includes a broader distribution across these tiers.

| Rarity | Crafting DC Modifier | Time Multiplier | Example Materials (Expanded) |
| :--- | :--- | :--- | :--- |
| Common | +0 | 1x | Iron, Oak, Leather, Bloodpurge, Owlbear Beak |
| Uncommon | +2 | 2x | Mithral, Blueleaf, Chitin, Firestone, Troll Fat, Gelatinous Cube Essence |
| Rare | +5 | 5x | Adamantine, Dragonhide (Red), Aboleth Mucus, Hydra Blood, Orichalcum, Blue Dragon Scale |
| Very Rare | +8 | 10x | Voidglass, Displacer Beast Hide, Spirit Stone, Ancient Gold Dragon Scale, Horacalcum |
| Legendary | +12 | 20x | Meteor Iron, Phoenix Feather, Sphinx Sand, Tarrasque Plate, Beholder Eye |
| Artifact | +15 | 30x | Tarrasque Plate (Full), Heart of a Primordial |

## 3. Harvesting Mechanics (Monster Drops)

Harvesting parts from monsters requires a specific skill check (usually Survival, Nature, or Medicine) and a harvesting kit. The DC is `10 + Monster CR (Challenge Rating)`.

*   **Success:** The player successfully extracts the desired part.
*   **Failure by 4 or less:** The part is extracted but damaged (yields half materials or a flawed version).
*   **Failure by 5 or more:** The part is ruined.

### 3.1 Harvesting Categories

*   **Hide/Scale/Shell:** Used for armor and shields. (Requires Leatherworker's Tools). Examples: Dragon Scales (all colors), Behir Scale, Flail Snail Shell.
*   **Bone/Fang/Horn/Claw:** Used for weapons, tools, and arcane foci. (Requires Woodcarver's or Smith's Tools). Examples: Dragon Claws (all colors), Hydra Fang, Unicorn Horn, Owlbear Beak.
*   **Blood/Venom/Gland:** Used for alchemy and poisons. (Requires Alchemist's Supplies or Poisoner's Kit). Examples: Dragon Blood (all colors), Aboleth Mucus, Kraken Ink, Gelatinous Cube Essence.
*   **Heart/Brain/Eye/Soul:** Used for high-end arcane crafting and enchantments. (Requires Arcana check and specialized tools). Examples: Dragon Heart Ember, Beholder Eye, Intellect Devourer Brain, Sphinx Sand.
*   **Fur/Feather/Wing/Web/Silk:** Used for garments, flight, stealth, binding, and ritual craft. Examples: Phoenix Feather, Yeti Fur, Drider Silk, Cloaker Wing.
*   **Meat/Fat/Gland/Brood Fruit/Eggs:** Used for food, brews, and monster cuisine. Examples: Troll Fat, Raw Meat, Monster Eggs.
*   **Elemental Cores/Crystals/Gas/Ash:** Used for magical reagents and infused items. Examples: Remorhaz Core, Efreeti Ember, Water Elemental Essence.

## 4. Game Rules Integration

*   **Weight and Properties:** Materials alter the base properties of items. Mithral removes the "Heavy" property and Strength requirements from armor. Densewood increases weapon damage.
*   **Durability:** Certain materials (like Adamantine or Ironwood) increase an item's hit points and damage threshold, making them harder to destroy.
*   **Synergy:** Combining materials of the same elemental affinity (e.g., Firestone + Red Dragon Scale) lowers the crafting DC by 2. Using materials from a specific creature type (e.g., Fey) might grant bonuses against that type.

## 5. React Implementation Notes

When building this in React, the crafting system should rely on a robust state management solution (like Redux or Context API) to track the player's inventory, known recipes, and current crafting progress. The expanded JSON structures (detailed in the next phase) will serve as the database for all items, materials, and recipes, now encompassing a much wider range of possibilities.
