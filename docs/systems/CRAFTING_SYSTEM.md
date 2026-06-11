# ⚒️ D&D Crafting System: Architecture & Data Structures

This document defines the JSON schemas and data structures for the Artificer crafting system. It is designed to be compatible with the **Inventory V2 (Registry/Slot)** architecture and supports over 250 materials across Smithing, Alchemy, Cooking, and Arcane Crafting.

## 1. Material Template (`material.schema.json`)

Materials are static entities defined in the Atlas. They serve as the building blocks for all recipes.

**Path**: `public/assets/atlas/materials_categories/json/`

```json
{
  "id": "string",
  "name": "string",
  "index": "string",
  "category": "string", // e.g., "Metal", "Herb", "Monster Part"
  "rarity": "string",   // Common, Uncommon, Rare, Very Rare, Legendary
  "properties": ["string"],
  "gameEffect": "string", // Mechanical description for the AI DM
  "weight": "number",
  "value": "number"
}
```

**Example Material:**
```json
{
  "id": "red_dragon_scale",
  "name": "Red Dragon Scale",
  "index": "red_dragon_scale",
  "category": "Monster Part",
  "rarity": "Rare",
  "properties": ["Fiery", "Hard"],
  "gameEffect": "Used to craft armor with Fire Resistance.",
  "weight": 1,
  "value": 150
}
```

## 2. Recipe Template (`recipe.schema.json`)

Recipes define the requirements and the resulting output. They are stored in the Atlas and referenced by the AI DM during crafting actions.

**Path**: `public/assets/atlas/recipes/json/`

```json
{
  "id": "string",
  "name": "string",
  "index": "string",
  "outputTemplateId": "string", // Reference to an Item Template index
  "outputQuantity": "number",
  "baseItemTemplateId": "string", // Optional: e.g., a "Longsword" to be upgraded
  "ingredients": [
    {
      "templateId": "string", // Reference to Material or Item template
      "quantity": "number",
      "isPrimary": "boolean"
    }
  ],
  "requiredTools": ["string"], // e.g., ["smith_tools"]
  "skillChecks": [
    {
      "skill": "string", // e.g., "Athletics", "Arcana"
      "dc": "number"
    }
  ],
  "craftingTime": "string", // e.g., "8 hours", "7 days"
  "goldCost": "number",     // Extra costs (fuel, specialized workspace)
  "craftingType": "Smithing" | "Alchemy" | "Cooking" | "Arcane"
}
```

## 3. Inventory V2 Integration

In the V2 system, materials and crafted items are treated as **ItemInstances** in the character's central registry.

### Material Instance
When a player finds "Red Dragon Scale", it is added to their `items` registry using the `material` template.

```json
{
  "id": "uuid-v4-scale-123",
  "template": "red_dragon_scale",
  "quantity": 5,
  "kind": "material",
  "addedAt": 1739812345
}
```

### Crafted Item Instance
When an item is successfully crafted, it is added to the registry. If it's a standard item (e.g., "Potion of Healing"), it uses that template. If it's a unique crafted item (e.g., "Red Dragon Scale Armor"), it refers to its specific template in the Atlas.

```json
{
  "id": "uuid-v4-armor-999",
  "template": "red_dragon_scale_armor",
  "quantity": 1,
  "kind": "armor",
  "addedAt": 1739812400
}
```

## 4. Crafting Logic Flow (AI DM)

1.  **Requirement Check**: AI verifies the player has the `ingredients` in their `items` registry and the `requiredTools` equipped or in a container.
2.  **Skill Resolution**: AI triggers a `rollCheck` for the required skills.
3.  **State Update**:
    - AI calls `removeItem(ingredientId, quantity)` for each ingredient.
    - AI calls `addItem(outputTemplateId, quantity)`.
4.  **Narration**: AI describes the crafting process based on the `gameEffect` of the materials used.

## 5. Materials Database Status

The project currently tracks materials in the following category files:
- `bundled_materials.json`
- `common_materials.json`
- `consumables.json`
- `herbs.json`
- `monster_parts.json`
- `oils.json`
- `raw_materials.json`
- `refined_materials.json`

Total unique materials indexed: **~259**.

---
*Note: For image generation guidelines for these materials, see [skills/atlas-materials/SKILL.md](../../skills/atlas-materials/SKILL.md).*
