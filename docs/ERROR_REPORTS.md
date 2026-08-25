# Error Reports

This file is used to track and communicate errors between the user, CLI, and AI agents.

## Active Issues
1. **Legacy Character Save V1 -> V2 Migration Gap** [VERIFIED]
   - *Description*: Loaded V1 character saves remained unmigrated at runtime boundary, causing inventory items to fail rendering in Inventory V2 workspace.
   - *Status*: VERIFIED. Integrated `migrateCharacterV1ToV2` inside `saveService.ts` character loading pipeline.

2. **Recruit NPC Mixed Inventory Normalization** [VERIFIED]
   - *Description*: Recruit NPC records with legacy `backpack` and `inventory` fields were not normalized into canonical V2 containers.
   - *Status*: VERIFIED. Integrated `migrateCharacterV1ToV2` inside `fetchRecruitNPCData` in `storageService.ts` and verified with real repository JSON unit tests.

3. **dnd-kit Drag-and-Drop Pointer Sensor Activation Contract** [FIXED]
   - *Description*: Unconstrained pointer sensors caused click inspection to conflict with drag activations on item cards.
   - *Status*: FIXED. Added PointerSensor activation constraint (`distance: 5`) to `DndContext` in `FullInventoryMenu.tsx`.

## Reporting a new issue
When reporting an issue, please include:
1. **Description**: What happened?
2. **Steps to Reproduce**: How can we trigger it again?
3. **Logs/Screenshots**: Any error messages or visual evidence.
4. **Environment**: Which agent or tool was being used?
