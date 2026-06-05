# D&D Crafting System: JSON Schema and Data Structures (Expanded)

This document defines the JSON schema and data structures for implementing the D&D crafting system in a React application. These structures have been expanded to accommodate a comprehensive database of over 200 materials and detailed mechanics for Weapons & Armor, Alchemy, Food & Cooking, and Arcane Crafting.

## 1. Material Data Structure (`Material.json`)

Each material will be represented as a JSON object with the following structure:

```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "subCategory": "string",
  "rarity": "string",
  "properties": ["string"],
  "gameEffect": "string",
  "source": "string"
}
```

**Example `Material.json` Entry (Expanded):**

```json
{
  "id": "red_dragon_scale",
  "name": "Red Dragon Scale",
  "category": "Hide",
  "subCategory": "Dragon",
  "rarity": "Rare",
  "properties": ["Fiery", "Hard"],
  "gameEffect": "Grants Resistance to Fire damage when crafted into armor.",
  "source": "5e SRD"
}
```

## 2. Recipe Data Structure (`Recipe.json`)

Each crafting recipe will be represented as a JSON object, detailing the required components and the resulting item. This structure is designed to be highly flexible, accommodating recipes across all crafting types (Smithing, Alchemy, Cooking, Arcane).

```json
{
  "id": "string",
  "name": "string",
  "outputItemId": "string",
  "outputItemQuantity": "number",
  "baseItem": {
    "id": "string",
    "name": "string"
  },
  "primaryMaterial": {
    "id": "string",
    "quantity": "number"
  },
  "secondaryMaterials": [
    {
      "id": "string",
      "quantity": "number"
    }
  ],
  "requiredTools": ["string"],
  "craftingDC": "number",
  "craftingTime": "string",
  "craftingCost": "number",
  "description": "string",
  "craftingType": "string" // e.g., "Smithing", "Alchemy", "Cooking", "Arcane"
}
```

**Example `Recipe.json` Entries (Expanded):**

**Smithing Recipe (Dragon Scale Armor):**
```json
{
  "id": "red_dragon_scale_armor",
  "name": "Red Dragon Scale Armor",
  "outputItemId": "red_dragon_scale_armor_item",
  "outputItemQuantity": 1,
  "baseItem": {
    "id": "leather_armor",
    "name": "Leather Armor"
  },
  "primaryMaterial": {
    "id": "red_dragon_scale",
    "quantity": 15
  },
  "secondaryMaterials": [
    {
      "id": "darksteel",
      "quantity": 2
    }
  ],
  "requiredTools": ["Leatherworker\"s Tools", "Smith\"s Tools"],
  "craftingDC": 20,
  "craftingTime": "7 days",
  "craftingCost": 1200,
  "description": "Crafts a set of scale armor from red dragon scales, granting fire resistance.",
  "craftingType": "Smithing"
}
```

**Alchemy Recipe (Potion of Fire Breath):**
```json
{
  "id": "potion_of_fire_breath_red",
  "name": "Potion of Fire Breath (Red Dragon)",
  "outputItemId": "potion_of_fire_breath_red_item",
  "outputItemQuantity": 1,
  "baseItem": {
    "id": "potion_vial",
    "name": "Potion Vial"
  },
  "primaryMaterial": {
    "id": "red_dragon_blood",
    "quantity": 1
  },
  "secondaryMaterials": [
    {
      "id": "firestone",
      "quantity": 1
    },
    {
      "id": "hiexel",
      "quantity": 1
    }
  ],
  "requiredTools": ["Alchemist\"s Supplies"],
  "craftingDC": 16,
  "craftingTime": "6 hours",
  "craftingCost": 60,
  "description": "A fiery concoction that allows the drinker to unleash a blast of dragonfire.",
  "craftingType": "Alchemy"
}
```

**Food/Cooking Recipe (Dragon Steak):**
```json
{
  "id": "dragon_steak_red",
  "name": "Dragon Steak (Red Dragon)",
  "outputItemId": "dragon_steak_red_item",
  "outputItemQuantity": 1,
  "baseItem": {
    "id": "cooking_pot",
    "name": "Cooking Pot"
  },
  "primaryMaterial": {
    "id": "red_dragon_meat",
    "quantity": 1
  },
  "secondaryMaterials": [
    {
      "id": "pepper",
      "quantity": 1
    },
    {
      "id": "basil",
      "quantity": 1
    }
  ],
  "requiredTools": ["Cook\"s Utensils"],
  "craftingDC": 16,
  "craftingTime": "2 hours",
  "craftingCost": 50,
  "description": "A rare and potent meal prepared from the flesh of a red dragon, imbuing the consumer with temporary fire resistance.",
  "craftingType": "Cooking"
}
```

**Arcane Crafting Recipe (Staff of the Woodlands):**
```json
{
  "id": "staff_of_the_woodlands",
  "name": "Staff of the Woodlands",
  "outputItemId": "staff_of_the_woodlands_item",
  "outputItemQuantity": 1,
  "baseItem": {
    "id": "quarterstaff",
    "name": "Quarterstaff"
  },
  "primaryMaterial": {
    "id": "weirwood",
    "quantity": 1
  },
  "secondaryMaterials": [
    {
      "id": "livewood",
      "quantity": 1
    },
    {
      "id": "emerald",
      "quantity": 1
    },
    {
      "id": "fey_dust",
      "quantity": 1
    }
  ],
  "requiredTools": ["Woodcarver\"s Tools", "Arcana proficiency", "Nature proficiency"],
  "craftingDC": 25,
  "craftingTime": "20 days",
  "craftingCost": 5000,
  "description": "A staff carved from ancient, living wood, pulsating with natural magic.",
  "craftingType": "Arcane"
}
```

## 3. Crafted Item Data Structure (`CraftedItem.json`)

This structure represents an item that has been successfully crafted, inheriting properties from its materials and recipe. It includes comprehensive fields to accommodate various item types, including weapons, armor, alchemical items, food, and arcane artifacts.

```json
{
  "id": "string",
  "name": "string",
  "type": "string", // e.g., "Heavy Armor", "Potion", "Food", "Scroll", "Wand"
  "description": "string",
  "rarity": "string",
  "properties": ["string"],
  "gameEffect": "string",
  "baseAC": "number", // For armor
  "strengthRequirement": "number", // For armor
  "stealthDisadvantage": "boolean", // For armor
  "damageDice": "string", // For weapons
  "damageType": "string", // For weapons
  "range": "string", // For weapons or thrown items
  "charges": "number", // For wands/staves
  "spellLevel": "number", // For scrolls
  "buffDuration": "string", // For potions/food
  "healingAmount": "string", // For potions/food
  "weight": "number",
  "value": "number",
  "materialComposition": [
    {
      "materialId": "string",
      "role": "string" // e.g., "primary", "secondary", "base"
    }
  ]
}
```

**Example `CraftedItem.json` Entries (Expanded):**

**Armor Item (Red Dragon Scale Armor):**
```json
{
  "id": "red_dragon_scale_armor_item",
  "name": "Red Dragon Scale Armor",
  "type": "Medium Armor",
  "description": "A set of scale armor crafted from the tough, fiery scales of a red dragon.",
  "rarity": "Rare",
  "properties": ["Durable", "Fire Resistance"],
  "gameEffect": "Grants Resistance to Fire damage.",
  "baseAC": 14,
  "strengthRequirement": null,
  "stealthDisadvantage": false,
  "damageDice": null,
  "damageType": null,
  "range": null,
  "charges": null,
  "spellLevel": null,
  "buffDuration": null,
  "healingAmount": null,
  "weight": 20,
  "value": 2500,
  "materialComposition": [
    {
      "materialId": "red_dragon_scale",
      "role": "primary"
    },
    {
      "materialId": "darksteel",
      "role": "secondary"
    }
  ]
}
```

**Alchemy Item (Potion of Fire Breath):**
```json
{
  "id": "potion_of_fire_breath_red_item",
  "name": "Potion of Fire Breath (Red Dragon)",
  "type": "Potion",
  "description": "A fiery concoction that allows the drinker to unleash a blast of dragonfire.",
  "rarity": "Rare",
  "properties": ["Consumable", "Elemental"],
  "gameEffect": "Allows casting of Fire Breath (3d6 Fire damage, 15ft cone, Dex save for half).",
  "baseAC": null,
  "strengthRequirement": null,
  "stealthDisadvantage": null,
  "damageDice": null,
  "damageType": null,
  "range": "15ft cone",
  "charges": null,
  "spellLevel": null,
  "buffDuration": "Instantaneous",
  "healingAmount": null,
  "weight": 0.5,
  "value": 300,
  "materialComposition": [
    {
      "materialId": "red_dragon_blood",
      "role": "primary"
    },
    {
      "materialId": "firestone",
      "role": "secondary"
    }
  ]
}
```

**Food Item (Dragon Steak):**
```json
{
  "id": "dragon_steak_red_item",
  "name": "Dragon Steak (Red Dragon)",
  "type": "Food",
  "description": "A rare and potent meal prepared from the flesh of a red dragon.",
  "rarity": "Rare",
  "properties": ["Consumable", "Buff"],
  "gameEffect": "Grants Resistance to Fire damage for 1 hour.",
  "baseAC": null,
  "strengthRequirement": null,
  "stealthDisadvantage": null,
  "damageDice": null,
  "damageType": null,
  "range": null,
  "charges": null,
  "spellLevel": null,
  "buffDuration": "1 hour",
  "healingAmount": null,
  "weight": 1,
  "value": 250,
  "materialComposition": [
    {
      "materialId": "red_dragon_meat",
      "role": "primary"
    }
  ]
}
```

**Arcane Item (Staff of the Woodlands):**
```json
{
  "id": "staff_of_the_woodlands_item",
  "name": "Staff of the Woodlands",
  "type": "Staff",
  "description": "A staff carved from ancient, living wood, pulsating with natural magic.",
  "rarity": "Very Rare",
  "properties": ["Magical", "Attunement"],
  "gameEffect": "Acts as a +2 quarterstaff; can cast various plant-related spells (e.g., Pass Without Trace, Wall of Thorns).",
  "baseAC": null,
  "strengthRequirement": null,
  "stealthDisadvantage": null,
  "damageDice": "1d6 bludgeoning",
  "damageType": "Bludgeoning",
  "range": "Melee",
  "charges": 10,
  "spellLevel": null,
  "buffDuration": null,
  "healingAmount": null,
  "weight": 4,
  "value": 15000,
  "materialComposition": [
    {
      "materialId": "weirwood",
      "role": "primary"
    },
    {
      "materialId": "livewood",
      "role": "secondary"
    },
    {
      "materialId": "emerald",
      "role": "secondary"
    }
  ]
}
```

## 4. Inventory Data Structure (`Inventory.json`)

This structure will manage the player's inventory of materials and crafted items:

```json
{
  "materials": [
    {
      "materialId": "string",
      "quantity": "number"
    }
  ],
  "craftedItems": [
    {
      "itemId": "string",
      "quantity": "number"
    }
  ]
}
```

**Example `Inventory.json` Entry:**

```json
{
  "materials": [
    {
      "materialId": "adamantine",
      "quantity": 5
    },
    {
      "materialId": "red_dragon_scale",
      "quantity": 15
    },
    {
      "materialId": "blueleaf",
      "quantity": 12
    }
  ],
  "craftedItems": [
    {
      "itemId": "adamantine_plate_armor_item",
      "quantity": 1
    },
    {
      "itemId": "potion_of_greater_healing_item",
      "quantity": 3
    },
    {
      "itemId": "red_dragon_scale_armor_item",
      "quantity": 1
    }
  ]
}
```
