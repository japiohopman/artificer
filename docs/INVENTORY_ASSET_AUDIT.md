# Inventory & Starter Equipment Visual Asset Audit Report

## Summary Statistics (Starter Equipment)

- **Total Canonical Starter Items**: 92
- **READY (Sprite Image + Manifest Cell Contract Ready)**: 39
- **PLANNED (Cell Coordinate Assigned in Manifest, Image Planned)**: 53
- **MISSING (No Manifest Entry / Cell Assignment)**: 0

---

## Canonical Starter Items Audit (Class, Background & Pack Choices)

Which canonical starter items still need a visual?

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
| `hempen_rope_50_ft` | `equipment.hempen_rope_50_ft` | `starter_adventuring_01` | `(2, 2)` | `adventuring_gear` | background:sailor, pack_content:burglars-pack |
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

### Planned Starter Items (53)

| Canonical Item ID | Visual ID | Sheet | Cell (R, C) | Category | Sources |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `abacus` | `equipment.abacus` | `starter_personal_01` | `(4, 0)` | `personal` | background:artisan, background:merchant |
| `alms_box` | `equipment.alms_box` | `starter_spellcasting_01` | `(4, 0)` | `spellcasting` | pack_content:priests-pack |
| `arrow` | `equipment.arrow` | `starter_weapons_02` | `(4, 0)` | `weapon` | class:fighter, class:ranger |
| `ball_bearings` | `equipment.ball_bearings` | `starter_adventuring_01` | `(4, 0)` | `adventuring_gear` | pack_content:burglars-pack |
| `bell` | `equipment.bell` | `starter_personal_01` | `(3, 2)` | `personal` | pack_content:burglars-pack |
| `blanket` | `equipment.blanket` | `starter_adventuring_01` | `(5, 3)` | `adventuring_gear` | pack_content:priests-pack |
| `book` | `equipment.book` | `starter_personal_01` | `(4, 1)` | `personal` | background:acolyte, background:hermit |
| `book_of_lore` | `equipment.book_of_lore` | `starter_personal_01` | `(2, 1)` | `personal` | pack_content:scholars-pack |
| `calligraphers_supplies` | `equipment.calligraphers_supplies` | `starter_tools_01` | `(2, 0)` | `tool` | background:acolyte, background:sage |
| `candle` | `equipment.candle` | `starter_personal_01` | `(2, 2)` | `personal` | pack_content:burglars-pack, pack_content:entertainers-pack |
| `carpenters_tools` | `equipment.carpenters_tools` | `starter_tools_01` | `(2, 1)` | `tool` | background:farmer |
| `cartographers_tools` | `equipment.cartographers_tools` | `starter_tools_01` | `(2, 2)` | `tool` | background:guide |
| `censer` | `equipment.censer` | `starter_spellcasting_01` | `(4, 1)` | `spellcasting` | pack_content:priests-pack |
| `chest` | `equipment.chest` | `starter_adventuring_01` | `(5, 1)` | `container` | pack_content:diplomats-pack |
| `costume` | `equipment.costume` | `starter_personal_01` | `(0, 2)` | `personal` | background:charlatan, background:entertainer |
| `crossbow_bolt` | `equipment.crossbow_bolt` | `starter_weapons_02` | `(4, 1)` | `weapon` | class:cleric, class:fighter |
| `crowbar` | `equipment.crowbar` | `starter_personal_01` | `(3, 3)` | `personal` | background:criminal, background:wayfarer |
| `dice_set` | `equipment.dice_set` | `starter_tools_01` | `(3, 2)` | `tool` | background:guard, background:soldier |
| `disguise_kit` | `equipment.disguise_kit` | `starter_tools_01` | `(0, 1)` | `tool` | pack_content:entertainers-pack |
| `fine_clothes` | `equipment.fine_clothes` | `starter_personal_01` | `(0, 1)` | `personal` | background:charlatan, background:noble |
| `forgery_kit` | `equipment.forgery_kit` | `starter_tools_01` | `(0, 2)` | `tool` | background:charlatan |
| `gold` | `equipment.gold` | `starter_personal_01` | `(4, 2)` | `personal` | background:acolyte, background:artisan |
| `hammer` | `equipment.hammer` | `starter_adventuring_01` | `(4, 2)` | `adventuring_gear` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `herbalism_kit` | `equipment.herbalism_kit` | `starter_tools_01` | `(0, 3)` | `tool` | background:hermit |
| `incense_block` | `equipment.incense_block` | `starter_spellcasting_01` | `(4, 2)` | `spellcasting` | pack_content:priests-pack |
| `ink` | `equipment.ink` | `starter_personal_01` | `(1, 3)` | `personal` | background:sage, background:scribe |
| `ink_pen` | `equipment.ink_pen` | `starter_personal_01` | `(2, 0)` | `personal` | background:sage, background:scribe |
| `knife_small` | `equipment.knife_small` | `starter_personal_01` | `(4, 3)` | `personal` | pack_content:scholars-pack |
| `lamp` | `equipment.lamp` | `starter_personal_01` | `(2, 3)` | `personal` | pack_content:diplomats-pack |
| `lantern_hooded` | `equipment.lantern_hooded` | `starter_adventuring_01` | `(5, 0)` | `adventuring_gear` | background:guard, pack_content:burglars-pack |
| `little_bag_of_sand` | `equipment.little_bag_of_sand` | `starter_personal_01` | `(5, 0)` | `personal` | pack_content:scholars-pack |
| `lute` | `equipment.lute` | `starter_tools_01` | `(3, 1)` | `tool` | class:bard |
| `manacles` | `equipment.manacles` | `starter_personal_01` | `(5, 1)` | `personal` | background:guard |
| `map_case` | `equipment.map_case` | `starter_adventuring_01` | `(5, 2)` | `adventuring_gear` | pack_content:diplomats-pack |
| `navigators_tools` | `equipment.navigators_tools` | `starter_tools_01` | `(1, 0)` | `tool` | background:merchant, background:sailor |
| `oil_flask` | `equipment.oil_flask` | `starter_personal_01` | `(3, 0)` | `personal` | pack_content:burglars-pack, pack_content:diplomats-pack |
| `paper` | `equipment.paper` | `starter_personal_01` | `(1, 2)` | `personal` | pack_content:diplomats-pack |
| `parchment` | `equipment.parchment` | `starter_personal_01` | `(1, 1)` | `personal` | background:acolyte, background:sage |
| `perfume_vial` | `equipment.perfume_vial` | `starter_personal_01` | `(5, 2)` | `personal` | background:noble, pack_content:diplomats-pack |
| `piton` | `equipment.piton` | `starter_adventuring_01` | `(4, 3)` | `adventuring_gear` | pack_content:burglars-pack, pack_content:dungeoneers-pack |
| `playing_card_set` | `equipment.playing_card_set` | `starter_tools_01` | `(3, 3)` | `tool` | background:noble |
| `pot_iron` | `equipment.pot_iron` | `starter_adventuring_01` | `(6, 0)` | `adventuring_gear` | background:farmer |
| `pouch` | `equipment.pouch` | `starter_personal_01` | `(0, 3)` | `personal` | background:criminal, background:merchant |
| `quiver` | `equipment.quiver` | `starter_weapons_02` | `(4, 2)` | `weapon` | background:guard, background:guide |
| `robes` | `equipment.robes` | `starter_personal_01` | `(5, 3)` | `personal` | background:acolyte, background:sage |
| `scale_merchants` | `equipment.scale_merchants` | `starter_tools_01` | `(4, 0)` | `tool` | background:artisan |
| `sealing_wax` | `equipment.sealing_wax` | `starter_personal_01` | `(6, 0)` | `personal` | pack_content:diplomats-pack |
| `signet_ring` | `equipment.signet_ring` | `starter_personal_01` | `(1, 0)` | `personal` | background:noble |
| `soap` | `equipment.soap` | `starter_personal_01` | `(3, 1)` | `personal` | pack_content:diplomats-pack |
| `string` | `equipment.string` | `starter_adventuring_01` | `(4, 1)` | `adventuring_gear` | pack_content:burglars-pack |
| `thieves_tools` | `equipment.thieves_tools` | `starter_tools_01` | `(0, 0)` | `tool` | class:rogue, background:criminal |
| `travelers_clothes` | `equipment.travelers_clothes` | `starter_personal_01` | `(0, 0)` | `personal` | background:acolyte, background:artisan |
| `vestments` | `equipment.vestments` | `starter_spellcasting_01` | `(4, 3)` | `spellcasting` | pack_content:priests-pack |

### Missing Starter Items (0)

| Canonical Item ID | Visual ID | Category | Sources |
| :--- | :--- | :--- | :--- |
_None! All canonical starter equipment items are covered by READY or PLANNED manifest cells._

---

## Full Catalog Audit Summary (1001 Items Total)

- **Starter Equipment Items**: 92
- **Progression / Catalog Items**: 909

_Report generated automatically by `tools/auditStarterEquipment.cjs`._
