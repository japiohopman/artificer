## Now

*Restructured for the Jules orchestrator: it only ever dispatches from ### Ready. Nothing
under ### Blocked or ### Human Review will be picked up automatically — those need you
(and whoever else is reviewing) to move them to Ready first, once they're safe to hand off.
This is a draft placement based on the last deep-dive — re-sort as you see fit before this
goes live, especially anything that looks architectural rather than a discrete fix.*

### Active
<!-- The orchestrator moves a task here when it starts it. At most one at a time in v1. -->

### Ready
- [ ] XP animation — animate the XP bar fill in CharacterPanel.tsx instead of an instant jump
- [ ] Inventory: container system + grid inventory with per-category sub-tabs (FullInventoryMenu.tsx is still a 193-line shell)
- [ ] Equipment_categories JSON: fix stale `url` fields to point at the real `/14/` and `/24/` versioned paths (see the equipment-atlas deep dive)

### Blocked
<!-- Move a task here yourself with a short reason if it's waiting on something outside Jules's control. -->

### Human Review
- [ ] Character creation: point-buy stat system (currently standard-array + manual roll only) — worth deciding the exact rules before handing this to Jules
- [ ] Character creation: advanced spellbook filters (level/ritual/concentration) — same, small design decision needed first

### Done this cycle (confirmed, not yet folded into GOALS.md phases)
- [x] Combat loop — XP/leveling bugs fixed and verified
- [x] Shared party XP (addPartyXp)
- [x] Location discovery
- [x] Fog-of-war granularity (pre-visible seas vs. discovered areas)
- [x] Right-hand character panel (portrait, level, XP bar)
- [x] Fuller character sheet (AC/HP/initiative via GameIcon, not bare numbers) — largely done, worth a final pass
