# Rapport: save mechanisme, item instances en slots

Laatste update: 2026-06-05

Doel van dit rapport: een duidelijk technisch beeld geven van wat er misgaat in het huidige character save mechanisme en hoe dit beter kan worden ingericht voor een D&D game met inventory, equipment slots, backpacks, chests, tools, foci en drag/drop.

Dit rapport is bedoeld als ondersteuning naast `todo.txt`.

## Samenvatting

Het huidige save model bewaart te veel template-data direct in de character save. Items in `backpack` en `inventory` bevatten nu complete equipment objecten met velden zoals `desc`, `imageUrl`, `equipment_category`, `damage`, `properties`, `sprite_sheet`, `updated_at`, enzovoort.

Dat werkt in het begin, maar wordt snel kwetsbaar:

- saves worden groot
- oude saves blijven oude item data vasthouden
- refactors aan equipment JSON breken of werken niet door in bestaande saves
- slots zijn inconsistent: soms `main-hand`, soms `main_hand`, soms `slot` als string, soms als array
- containers zoals backpack/chest/pouch zijn nog geen uniform systeem
- drag/drop moet speciale gevallen kennen voor backpack, equipment, chest, merchant, corpse
- tool slots en focus slots zijn nog niet stevig gedefinieerd

De aanbevolen richting is:

- Equipment JSON blijft template data.
- Character saves bewaren item instances.
- Alle item instances staan in een registry.
- Inventories en containers bestaan uit slots.
- Slots bewaren alleen `itemId`.
- Character equipment is ook gewoon een container met vaste slots.
- Backpacks, chests, pouches, corpses en merchants gebruiken exact hetzelfde slot systeem.

## Huidige situatie

In de huidige save staat bijvoorbeeld:

```json
"backpack": [
  {
    "id": "thieves_tools_gmgn3j3mu",
    "index": "thieves_tools",
    "name": "thieves' tools",
    "quantity": 1,
    "weight": 1,
    "_type": "equipment",
    "url": "public/assets/atlas/equipment/json/thieves_tools.json",
    "image_url": "public/assets/atlas/equipment/images/thieves_tools.webp",
    "imageUrl": "/api/raw?url=https%3A%2F%2Fraw.githubusercontent.com...",
    "equipment_category": {
      "index": "tools",
      "name": "tools",
      "url": "public/assets/atlas/equipment_categories/tools"
    },
    "desc": ["..."],
    "image": "public/assets/atlas/equipment/thieves_tools.webp",
    "sprite_index": 15,
    "sprite_sheet": "/artificer-main/codex/assets/equipment/sprites/equipment_sheet9.webp",
    "slot": ["tool"]
  }
]
```

En equipped items staan bijvoorbeeld zo:

```json
"inventory": {
  "chest": {
    "id": "leather_armor_9dt1nzgmj",
    "index": "leather_armor",
    "name": "leather armor",
    "desc": ["..."],
    "imageUrl": "/api/raw?url=https%3A%2F%2Fraw.githubusercontent.com...",
    "armor_class": {
      "base": 11,
      "dex_bonus": true
    },
    "slot": "chest"
  },
  "main-hand": {
    "id": "dagger_bjz5mp06w",
    "index": "dagger",
    "name": "dagger",
    "damage": {
      "damage_dice": "1d4"
    },
    "slot": "main-hand"
  }
}
```

Dit betekent dat de save op dit moment niet alleen de character state bewaart, maar ook een kopie van de equipment database.

## Wat er misgaat

### 1. Template data en instance data zijn door elkaar gemengd

Een equipment template is de vaste definitie van een item:

- naam
- beschrijving
- gewicht
- image
- cost
- damage
- armor class
- allowed slots
- category
- properties

Een item instance is een concreet item in de wereld:

- uniek id
- verwijzing naar template
- quantity
- durability
- charges
- attunement
- custom name
- container id
- ownership/location

In de huidige save worden deze twee gemixt. Daardoor wordt een save een rommelige combinatie van state en database.

### 2. Oude saves raken verouderd

Als `public/assets/atlas/equipment/json/dagger.json` later wordt verbeterd, dan heeft een bestaande save nog steeds zijn oude kopie van de dagger data.

Voorbeelden van wijzigingen die dan niet goed doorwerken:

- damage wordt aangepast
- image path wordt gefixt
- slot wordt veranderd
- category wordt genormaliseerd
- description wordt herschreven
- properties worden toegevoegd

Als de save volledige item objecten bewaart, moet je oude saves actief opschonen of blijven oude bugs bestaan.

### 3. Save files worden onnodig groot

Een backpack met 25 items kan 25 volledige equipment JSON-kopieen bevatten. Dat is veel data die al in `public/assets/atlas/equipment/json/` bestaat.

Een save moet vooral state bewaren. De vaste data moet uit templates worden geladen.

### 4. Paden in saves zijn fragiel

Er staan meerdere soorten paden door elkaar:

- `public/assets/...`
- `/assets/...`
- `/api/raw?url=https://raw.githubusercontent...`
- `/artificer-main/codex/assets/...`
- soms zonder `/json/`
- soms zonder `.json`

Voor runtime in een Vite/browser app is `/assets/...` het logische publieke pad. `public/assets/...` is de bronmap, niet het browserpad.

Saves moeten dit eigenlijk helemaal niet bewaren. Een save hoeft alleen `template: "dagger"` te bewaren. De app kan daarna via `equipmentIndex["dagger"].imageUrl` het juiste plaatje vinden.

### 5. Slot ids zijn inconsistent

Voorbeelden:

- `main-hand`
- `off-hand`
- `tool`
- `extra`
- `back`
- `chest`
- `clothes`
- `ammo`

Daarnaast is `slot` soms een string:

```json
"slot": "off-hand"
```

En soms een array:

```json
"slot": ["tool"]
```

Dit maakt validatie en UI gedrag moeilijker. Gebruik intern liever altijd:

```json
"equipSlots": ["main_hand"]
```

Dus:

- snake_case
- altijd array
- vaste slot catalogus

### 6. `extra` is geen equipment slot

Items zoals pitons, rations, waterskin en rope hebben soms `slot: ["extra"]`.

Dat is verwarrend. `extra` voelt alsof het item equipped is, maar eigenlijk hoort het gewoon in een container/backpack of eventueel quickbar.

Advies:

- `extra` niet gebruiken als equipment slot
- losse gear gaat in backpack/container
- gebruik quick slots voor actief bruikbare items

### 7. Tools hebben echte slots nodig

Tools zoals `thieves_tools`, `herbalism_kit`, `disguise_kit`, `forgery_kit` en `navigators_tools` zijn in D&D geen gewone rommel. Ze beinvloeden checks en proficiencies.

Als tools alleen in de backpack liggen, moet de game telkens raden welke tool actief is.

Advies:

- voeg `tool_1`, `tool_2`, `tool_3` toe
- equipped tools kunnen dan worden gebruikt bij ability checks
- backpack tools blijven gewoon opgeslagen, maar zijn niet actief/equipped

### 8. Foci hebben een eigen slot nodig

`public/assets/atlas/equipment_categories/json/arcane_foci.json` bestaat al met:

- crystal
- orb
- rod
- staff
- wand

Deze items moeten niet onder tool worden gegooid. Een focus is spellcasting equipment, geen proficiency tool.

Advies:

- voeg slot `focus` toe
- voeg `kind: "focus"` toe aan focus items
- voeg `focusType: "arcane"` toe voor arcane foci
- later ook `focusType: "druidic"` en `focusType: "holy_symbol"`

Voorbeeld:

```json
{
  "index": "wand",
  "kind": "focus",
  "focusType": "arcane",
  "equipSlots": ["focus", "main_hand", "off_hand"]
}
```

Sommige foci kunnen in een hand gebruikt worden, maar het focus slot blijft nuttig als spellcasting abstraction.

### 9. Containers zijn nog geen uniform inventory systeem

De huidige save gebruikt `backpack: Item[]`. Dat is eenvoudig, maar beperkt.

Voor een D&D game wil je dezelfde code gebruiken voor:

- player backpack
- chest
- pouch
- bag of holding
- corpse loot
- merchant inventory
- party stash

Als elk type een eigen structuur krijgt, ontstaat snel veel speciale code.

Advies: elk containerachtig object krijgt:

```json
{
  "id": "container_backpack_001",
  "type": "backpack",
  "slots": [
    { "id": "slot_0", "itemId": "item_gold_001" },
    { "id": "slot_1", "itemId": null }
  ]
}
```

## Aanbevolen nieuw save model

Een goede save heeft drie lagen:

1. Character state
2. Item instances
3. Containers/equipment slots

### Voorbeeldstructuur

```json
{
  "saveVersion": 2,
  "id": "slot3",
  "name": "ljn",
  "level": 1,
  "xp": 0,
  "race": "half_elf",
  "class": "rogue",

  "stats": {
    "str": 13,
    "dex": 13,
    "con": 13,
    "int": 13,
    "wis": 9,
    "cha": 7
  },

  "money": {
    "cp": 0,
    "sp": 0,
    "ep": 0,
    "gp": 10,
    "pp": 0
  },

  "equipment": {
    "containerId": "equipment_slot3",
    "slots": [
      { "id": "chest", "itemId": "item_leather_armor_001" },
      { "id": "main_hand", "itemId": "item_dagger_001" },
      { "id": "off_hand", "itemId": "item_shortsword_001" },
      { "id": "ranged", "itemId": "item_shortbow_001" },
      { "id": "ammo", "itemId": "item_arrows_001" },
      { "id": "tool_1", "itemId": "item_thieves_tools_001" },
      { "id": "tool_2", "itemId": null },
      { "id": "tool_3", "itemId": null },
      { "id": "focus", "itemId": null },
      { "id": "back", "itemId": "item_backpack_001" }
    ]
  },

  "containers": {
    "container_backpack_001": {
      "id": "container_backpack_001",
      "type": "backpack",
      "ownerId": "slot3",
      "slots": [
        { "id": "bag_0", "itemId": "item_crowbar_001" },
        { "id": "bag_1", "itemId": "item_rope_001" },
        { "id": "bag_2", "itemId": null }
      ]
    }
  },

  "items": {
    "item_backpack_001": {
      "id": "item_backpack_001",
      "template": "backpack",
      "quantity": 1,
      "containerId": "container_backpack_001"
    },
    "item_dagger_001": {
      "id": "item_dagger_001",
      "template": "dagger",
      "quantity": 2,
      "durability": 100
    },
    "item_thieves_tools_001": {
      "id": "item_thieves_tools_001",
      "template": "thieves_tools",
      "quantity": 1
    }
  }
}
```

## Slot catalogus

Maak een centrale slot catalogus. Dit kan in assets of in source code. Belangrijk is dat er een enkele bron van waarheid is.

Aanbevolen character equipment slots:

```json
[
  { "id": "main_hand", "label": "Main hand" },
  { "id": "off_hand", "label": "Off hand" },
  { "id": "ranged", "label": "Ranged weapon" },
  { "id": "ammo", "label": "Ammunition" },
  { "id": "chest", "label": "Armor" },
  { "id": "clothes", "label": "Clothes" },
  { "id": "head", "label": "Head" },
  { "id": "hands", "label": "Hands" },
  { "id": "feet", "label": "Feet" },
  { "id": "back", "label": "Back" },
  { "id": "neck", "label": "Neck" },
  { "id": "belt", "label": "Belt" },
  { "id": "ring_1", "label": "Ring 1" },
  { "id": "ring_2", "label": "Ring 2" },
  { "id": "tool_1", "label": "Tool 1" },
  { "id": "tool_2", "label": "Tool 2" },
  { "id": "tool_3", "label": "Tool 3" },
  { "id": "focus", "label": "Spellcasting focus" },
  { "id": "component_pouch", "label": "Component pouch" },
  { "id": "quick_1", "label": "Quick slot 1" },
  { "id": "quick_2", "label": "Quick slot 2" },
  { "id": "quick_3", "label": "Quick slot 3" },
  { "id": "quick_4", "label": "Quick slot 4" }
]
```

### Slot accept rules

Elke slot moet weten wat erin mag:

```json
{
  "id": "focus",
  "accepts": {
    "kinds": ["focus"],
    "focusTypes": ["arcane", "druidic", "holy_symbol"]
  }
}
```

```json
{
  "id": "tool_1",
  "accepts": {
    "kinds": ["tool"]
  }
}
```

```json
{
  "id": "off_hand",
  "accepts": {
    "kinds": ["weapon", "shield", "focus", "light_source", "tool"],
    "tags": ["light", "one_handed"]
  }
}
```

## Equipment template aanpassingen

Gebruik op templates liever:

- `kind`
- `equipSlots`
- `requiredSlots`
- `tags`
- `toolType`
- `focusType`

Voorbeeld tool:

```json
{
  "index": "thieves_tools",
  "kind": "tool",
  "toolType": "thieves_tools",
  "equipSlots": ["tool_1", "tool_2", "tool_3"],
  "proficiency": "thieves_tools"
}
```

Voorbeeld arcane focus:

```json
{
  "index": "wand",
  "kind": "focus",
  "focusType": "arcane",
  "equipSlots": ["focus", "main_hand", "off_hand"]
}
```

Voorbeeld two-handed weapon:

```json
{
  "index": "greatsword",
  "kind": "weapon",
  "weaponRange": "melee",
  "equipSlots": ["main_hand"],
  "requiredSlots": ["main_hand", "off_hand"],
  "tags": ["two_handed"]
}
```

Voorbeeld shield:

```json
{
  "index": "shield",
  "kind": "shield",
  "equipSlots": ["off_hand"],
  "requiredSlots": ["off_hand"]
}
```

## Migratieplan voor oude saves

### Stap 1: voeg saveVersion toe

Oude saves zonder `saveVersion` behandel je als versie 1.

```json
{
  "saveVersion": 1
}
```

Nieuwe saves krijgen:

```json
{
  "saveVersion": 2
}
```

### Stap 2: verzamel alle item objecten

Lees items uit:

- `backpack[]`
- `inventory.chest`
- `inventory.main-hand`
- `inventory.off-hand`
- `inventory.clothes`
- alle andere inventory keys

### Stap 3: maak item instances

Van dit oude object:

```json
{
  "id": "dagger_4f92qfxzk",
  "index": "dagger",
  "quantity": 2,
  "name": "dagger",
  "damage": { "damage_dice": "1d4" },
  "imageUrl": "/api/raw?url=..."
}
```

Maak:

```json
{
  "id": "item_dagger_4f92qfxzk",
  "template": "dagger",
  "quantity": 2
}
```

Bewaar alleen instance velden.

### Stap 4: maak equipment slots

Van:

```json
"inventory": {
  "main-hand": { "id": "dagger_abc", "index": "dagger" }
}
```

Naar:

```json
"equipment": {
  "containerId": "equipment_slot3",
  "slots": [
    { "id": "main_hand", "itemId": "item_dagger_abc" }
  ]
}
```

### Stap 5: maak backpack container

Van:

```json
"backpack": [
  { "id": "crowbar_abc", "index": "crowbar" },
  { "id": "rope_def", "index": "rope_hempen_50_feet" }
]
```

Naar:

```json
"containers": {
  "container_player_backpack": {
    "id": "container_player_backpack",
    "type": "backpack",
    "ownerId": "slot3",
    "slots": [
      { "id": "bag_0", "itemId": "item_crowbar_abc" },
      { "id": "bag_1", "itemId": "item_rope_def" }
    ]
  }
}
```

### Stap 6: map oude slot ids

Gebruik deze migratie mapping:

```json
{
  "main-hand": "main_hand",
  "off-hand": "off_hand",
  "two-hand": "main_hand",
  "tool": "tool_1",
  "ammo": "ammo",
  "back": "back",
  "chest": "chest",
  "clothes": "clothes",
  "neck": "neck",
  "extra": "backpack"
}
```

Let op: `extra` wordt niet naar een equipment slot gemigreerd. Items met `extra` gaan naar backpack of eventueel quick slots.

### Stap 7: verwijder oude velden uit save

Verwijder uit save item instances:

- `name`
- `desc`
- `image`
- `image_url`
- `imageUrl`
- `url`
- `equipment_category`
- `gear_category`
- `damage`
- `properties`
- `sprite_index`
- `sprite_sheet`
- `updated_at`
- `last_updated`
- `background_type`

Deze velden komen uit templates of indexes.

## Equip action ontwerp

Een equip action moet niet simpelweg een item in een object key zetten. Hij moet valideren.

Input:

```json
{
  "characterId": "slot3",
  "itemId": "item_wand_001",
  "from": {
    "containerId": "container_player_backpack",
    "slotId": "bag_4"
  },
  "to": {
    "containerId": "equipment_slot3",
    "slotId": "focus"
  }
}
```

Checks:

- bestaat `itemId`?
- bestaat template?
- bestaat target slot?
- accepteert target slot deze `kind`?
- vereist item extra slots?
- zijn required slots vrij?
- heeft character proficiency nodig?
- is class geschikt voor focus?
- moet quantity gesplitst worden?
- moet item uit oude container worden verwijderd?
- moet vorige equipped item terug naar backpack?

Output:

- update `equipment.slots`
- update oude container slot
- eventueel update item instance state

## Drag/drop ontwerp voor DnD-kit

Gebruik overal dezelfde shape:

```json
{
  "containerId": "container_player_backpack",
  "slotId": "bag_15"
}
```

Voor equipment:

```json
{
  "containerId": "equipment_slot3",
  "slotId": "main_hand"
}
```

Voor chest:

```json
{
  "containerId": "container_chest_001",
  "slotId": "slot_3"
}
```

Dan hoeft de UI niet te weten of iets een backpack, chest, corpse of equipped slot is. De reducer/action handelt dat af.

## Waarom dit beter is

### Savegames blijven stabiel

Slots en item ids blijven hetzelfde, ook als template data verandert.

### Minder data duplicatie

Een save bevat alleen wat uniek is aan deze run/character.

### Betere drag/drop

Alles is een container met slots. Geen speciale logica voor backpack vs chest vs equipment.

### Containers in containers worden eenvoudig

Een backpack in een chest is gewoon:

- chest container slot bevat `item_backpack_001`
- `item_backpack_001` heeft `containerId`
- die container heeft eigen slots

Geen diepe object nesting nodig.

### Equipment rules worden testbaar

Omdat slots en templates duidelijke rules hebben, kun je equip validation testen zonder UI.

## Concrete schemas die nodig zijn

Maak minimaal:

- `characterSave.schema.json`
- `itemInstance.schema.json`
- `inventoryContainer.schema.json`
- `inventorySlot.schema.json`
- `equipmentSlot.schema.json`
- `equipmentTemplate.schema.json`

Voor item templates later sub-schemas:

- `weapon.schema.json`
- `armor.schema.json`
- `shield.schema.json`
- `tool.schema.json`
- `focus.schema.json`
- `containerItem.schema.json`
- `consumable.schema.json`

## Prioriteiten voor implementatie

1. Maak een centrale slot catalogus.
2. Voeg `saveVersion` toe.
3. Bouw een migratiefunctie van oude save naar nieuwe save.
4. Maak item registry uit oude `backpack[]` en `inventory`.
5. Maak `equipment.slots`.
6. Maak `containers.container_player_backpack.slots`.
7. Verwijder template-data uit save output.
8. Voeg `kind`, `equipSlots` en `requiredSlots` toe aan equipment templates.
9. Voeg tool slots toe.
10. Voeg focus slot toe.
11. Laat DnD-kit werken met `containerId` + `slotId`.
12. Voeg validation toe voor equip/move/split/merge acties.

## Eindadvies

De huidige save is begrijpelijk als eerste versie, maar hij bewaart te veel volledige item data. Voor een D&D game met veel items, containers, slots, spells, tools en foci wordt dat snel instabiel.

De belangrijkste refactor is:

```txt
backpack: Item[]
inventory: { [slotId]: Item }
```

vervangen door:

```txt
items: { [itemId]: ItemInstance }
containers: { [containerId]: InventoryContainer }
equipment: { slots: InventorySlot[] }
```

Daarmee wordt de game veel makkelijker uit te breiden. Een chest, backpack, pouch, corpse, merchant en character equipment gebruiken dan dezelfde basisarchitectuur.

