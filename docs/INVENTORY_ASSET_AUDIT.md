# Inventory & Starter Equipment Visual Asset Audit Report

## Audit Status Terminology

- **READY**: Sprite image asset exists on disk AND manifest cell coordinate contract is complete.
- **PLANNED**: Canonical visual ID exists; sprite is planned but does not yet have a renderable cell.
- **MISSING**: Item reference exists in starter data but lacks a visual identity / manifest cell assignment.

_Note on "0 MISSING": This indicates 100% manifest and identity coverage (every canonical starter item has an assigned visual ID in the manifest). It does NOT mean 100% of final image sprite sheets have been rendered._

---

## Summary Statistics (Starter Equipment)

- **Total Canonical Starter Items**: 93
- **READY (Sprite Image + Manifest Cell Contract Ready)**: 39
- **PLANNED (Canonical Visual ID Registered, Sprite Asset Planned)**: 54
- **MISSING (No Manifest Entry / Cell Assignment)**: 0 (100% Manifest Identity Coverage)

---

## Canonical Starter Items Audit (Class, Background & Pack Choices)

### Ready Starter Items (39)

| Canonical Item ID | Visual ID | Sheet | Cell (R, C) | Category | Sources |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `amulet` | `equipment.amulet` | `starter_spellcasting_01` | `(2, 2)` | `spellcasting` | background:acolyte |
| `backpack` | `equipment.backpack` | `starter_adventuring_01` | `(2, 0)` | `container` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `bedroll` | `equipment.bedroll` | `starter_adventuring_01` | `(2, 1)` | `adventuring_gear` | background:guide, background:hermit |
| `burglars_pack` | `equipment.burglars_pack` | `starter_adventuring_01` | `(0, 2)` | `container` | class:rogue, equipment_pack:burglars-pack |
| `chain_mail` | `equipment.chain_mail` | `starter_armor_01` | `(2, 1)` | `armor` | class:cleric, class:fighter |
| `component_pouch` | `equipment.component_pouch` | `starter_spellcasting_01` | `(0, 1)` | `spellcasting` | class:sorcerer, class:warlock |
| `dagger` | `equipment.dagger` | `starter_weapons_01` | `(0, 0)` | `weapon` | class:bard, class:rogue |
| `dart` | `equipment.dart` | `starter_weapons_02` | `(1, 1)` | `weapon` | class:monk |
| `diplomats_pack` | `equipment.diplomats_pack` | `starter_adventuring_01` | `(0, 3)` | `container` | class:bard, equipment_pack:diplomats-pack |
| `dungeoneers_pack` | `equipment.dungeoneers_pack` | `starter_adventuring_01` | `(0, 1)` | `container` | class:fighter, class:monk |
| `entertainers_pack` | `equipment.entertainers_pack` | `starter_adventuring_01` | `(1, 0)` | `container` | class:bard, equipment_pack:entertainers-pack |
| `explorers_pack` | `equipment.explorers_pack` | `starter_adventuring_01` | `(0, 0)` | `container` | class:barbarian, class:cleric |
| `greataxe` | `equipment.greataxe` | `starter_weapons_01` | `(3, 1)` | `weapon` | class:barbarian |
| `handaxe` | `equipment.handaxe` | `starter_weapons_01` | `(0, 1)` | `weapon` | class:barbarian, class:fighter |
| `hempen_rope_50_ft` | `equipment.hempen_rope_50_ft` | `starter_adventuring_01` | `(2, 2)` | `adventuring_gear` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `javelin` | `equipment.javelin` | `starter_weapons_01` | `(0, 2)` | `weapon` | class:barbarian, class:paladin |
| `leather_armor` | `equipment.leather_armor` | `starter_armor_01` | `(0, 1)` | `armor` | class:bard, class:cleric |
| `light_crossbow` | `equipment.light_crossbow` | `starter_weapons_02` | `(0, 2)` | `weapon` | class:cleric, class:fighter |
| `longbow` | `equipment.longbow` | `starter_weapons_02` | `(0, 1)` | `weapon` | class:fighter, class:ranger |
| `longsword` | `equipment.longsword` | `starter_weapons_01` | `(2, 2)` | `weapon` | class:bard |
| `mace` | `equipment.mace` | `starter_weapons_01` | `(0, 3)` | `weapon` | class:cleric |
| `mess_kit` | `equipment.mess_kit` | `starter_adventuring_01` | `(3, 3)` | `adventuring_gear` | pack_content:explorers-pack |
| `priests_pack` | `equipment.priests_pack` | `starter_adventuring_01` | `(1, 1)` | `container` | class:cleric, class:paladin |
| `quarterstaff` | `equipment.quarterstaff` | `starter_weapons_01` | `(1, 0)` | `weapon` | class:wizard, background:hermit |
| `rapier` | `equipment.rapier` | `starter_weapons_01` | `(2, 1)` | `weapon` | class:bard, class:rogue |
| `rations` | `equipment.rations` | `starter_adventuring_01` | `(2, 3)` | `consumable` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `scale_mail` | `equipment.scale_mail` | `starter_armor_01` | `(1, 1)` | `armor` | class:cleric, class:ranger |
| `scholars_pack` | `equipment.scholars_pack` | `starter_adventuring_01` | `(1, 2)` | `container` | class:warlock, class:wizard |
| `scimitar` | `equipment.scimitar` | `starter_weapons_01` | `(2, 3)` | `weapon` | class:druid |
| `shield` | `equipment.shield` | `starter_armor_01` | `(3, 0)` | `armor` | class:cleric, class:druid |
| `shortbow` | `equipment.shortbow` | `starter_weapons_02` | `(0, 0)` | `weapon` | class:rogue, background:guide |
| `shortsword` | `equipment.shortsword` | `starter_weapons_01` | `(2, 0)` | `weapon` | class:monk, class:ranger |
| `sickle` | `equipment.sickle` | `starter_weapons_01` | `(1, 1)` | `weapon` | background:farmer |
| `spear` | `equipment.spear` | `starter_weapons_01` | `(1, 3)` | `weapon` | background:guard, background:soldier |
| `spellbook` | `equipment.spellbook` | `starter_spellcasting_01` | `(2, 1)` | `spellcasting` | class:wizard |
| `tinderbox` | `equipment.tinderbox` | `starter_adventuring_01` | `(3, 1)` | `adventuring_gear` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `torch` | `equipment.torch` | `starter_adventuring_01` | `(3, 0)` | `adventuring_gear` | pack_content:dungeoneers-pack, pack_content:explorers-pack |
| `warhammer` | `equipment.warhammer` | `starter_weapons_02` | `(2, 0)` | `weapon` | class:cleric |
| `waterskin` | `equipment.waterskin` | `starter_adventuring_01` | `(3, 2)` | `adventuring_gear` | pack_content:burglars-pack, pack_content:dungeoneers-pack |

### Planned Starter Items (54)

| Canonical Item ID | Visual ID | Category | Sources |
| :--- | :--- | :--- | :--- |
| `abacus` | `equipment.abacus` | `personal` | background:artisan, background:merchant |
| `alms_box` | `equipment.alms_box` | `spellcasting` | pack_content:priests-pack |
| `arrow` | `equipment.arrow` | `weapon` | class:fighter, class:ranger |
| `ball_bearings` | `equipment.ball_bearings` | `adventuring_gear` | pack_content:burglars-pack |
| `bell` | `equipment.bell` | `personal` | pack_content:burglars-pack |
| `blanket` | `equipment.blanket` | `adventuring_gear` | pack_content:priests-pack |
| `book` | `equipment.book` | `personal` | background:acolyte, background:hermit |
| `book_of_lore` | `equipment.book_of_lore` | `personal` | pack_content:scholars-pack |
| `calligraphers_supplies` | `equipment.calligraphers_supplies` | `tool` | background:acolyte, background:sage |
| `candle` | `equipment.candle` | `personal` | pack_content:burglars-pack, pack_content:entertainers-pack |
| `carpenters_tools` | `equipment.carpenters_tools` | `tool` | background:farmer |
| `cartographers_tools` | `equipment.cartographers_tools` | `tool` | background:guide |
| `censer` | `equipment.censer` | `spellcasting` | pack_content:priests-pack |
| `chest` | `equipment.chest` | `container` | pack_content:diplomats-pack |
| `costume` | `equipment.costume` | `personal` | background:charlatan, background:entertainer |
| `crossbow_bolt` | `equipment.crossbow_bolt` | `weapon` | class:cleric, class:fighter |
| `crowbar` | `equipment.crowbar` | `personal` | background:criminal, background:wayfarer |
| `dice_set` | `equipment.dice_set` | `tool` | background:guard, background:soldier |
| `disguise_kit` | `equipment.disguise_kit` | `tool` | pack_content:entertainers-pack |
| `fine_clothes` | `equipment.fine_clothes` | `personal` | background:charlatan, background:noble |
| `forgery_kit` | `equipment.forgery_kit` | `tool` | background:charlatan |
| `gold` | `equipment.gold` | `personal` | background:acolyte, background:artisan |
| `hammer` | `equipment.hammer` | `adventuring_gear` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `herbalism_kit` | `equipment.herbalism_kit` | `tool` | background:hermit |
| `incense_block` | `equipment.incense_block` | `spellcasting` | pack_content:priests-pack |
| `ink` | `equipment.ink` | `personal` | background:sage, background:scribe |
| `ink_pen` | `equipment.ink_pen` | `personal` | background:sage, background:scribe |
| `knife_small` | `equipment.knife_small` | `personal` | pack_content:scholars-pack |
| `lamp` | `equipment.lamp` | `personal` | pack_content:diplomats-pack |
| `lantern_hooded` | `equipment.lantern_hooded` | `adventuring_gear` | background:guard, pack_content:burglars-pack |
| `little_bag_of_sand` | `equipment.little_bag_of_sand` | `personal` | pack_content:scholars-pack |
| `lute` | `equipment.lute` | `tool` | class:bard |
| `manacles` | `equipment.manacles` | `personal` | background:guard |
| `map_case` | `equipment.map_case` | `adventuring_gear` | pack_content:diplomats-pack |
| `navigators_tools` | `equipment.navigators_tools` | `tool` | background:merchant, background:sailor |
| `oil_flask` | `equipment.oil_flask` | `personal` | pack_content:burglars-pack, pack_content:diplomats-pack |
| `paper` | `equipment.paper` | `personal` | pack_content:diplomats-pack |
| `parchment` | `equipment.parchment` | `personal` | background:acolyte, background:sage |
| `perfume_vial` | `equipment.perfume_vial` | `personal` | background:noble, pack_content:diplomats-pack |
| `piton` | `equipment.piton` | `adventuring_gear` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `playing_card_set` | `equipment.playing_card_set` | `tool` | background:noble |
| `pot_iron` | `equipment.pot_iron` | `adventuring_gear` | background:farmer |
| `pouch` | `equipment.pouch` | `personal` | background:criminal, background:merchant |
| `quiver` | `equipment.quiver` | `weapon` | background:guard, background:guide |
| `robes` | `equipment.robes` | `personal` | background:acolyte, background:sage |
| `scale_merchants` | `equipment.scale_merchants` | `tool` | background:artisan |
| `sealing_wax` | `equipment.sealing_wax` | `personal` | pack_content:diplomats-pack |
| `signet_ring` | `equipment.signet_ring` | `personal` | background:noble |
| `silk_rope_50_ft` | `equipment.silk_rope_50_ft` | `adventuring_gear` | background:sailor |
| `soap` | `equipment.soap` | `personal` | pack_content:diplomats-pack |
| `string` | `equipment.string` | `adventuring_gear` | pack_content:burglars-pack |
| `thieves_tools` | `equipment.thieves_tools` | `tool` | class:rogue, background:criminal |
| `travelers_clothes` | `equipment.travelers_clothes` | `personal` | background:acolyte, background:artisan |
| `vestments` | `equipment.vestments` | `spellcasting` | pack_content:priests-pack |

### Missing Starter Items (0)

| Canonical Item ID | Visual ID | Category | Sources |
| :--- | :--- | :--- | :--- |
_None! All canonical starter equipment items are covered by READY or PLANNED manifest entries._

---

## Full Catalog Audit Summary (1001 Items Total)

- **Starter Equipment Items**: 93
- **Progression / Catalog Items**: 908

_Report generated automatically by `tools/auditStarterEquipment.cjs`._
