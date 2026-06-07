# Inventory V2 (Registry/Slot System)

## Purpose
Inventory V2 is a sophisticated item management system designed for save stability and mechanical depth. It separates item *templates* from item *instances*.

## Owner
Skill Agent / Jules Agent

## Architecture
### Registry/Slot Pattern
- **Item Registry**: A character's save contains a `Record<string, ItemInstance>` of every unique item they own.
- **Containers**: Objects (Backpacks, Chests) that contain a list of `InventorySlot` objects.
- **Slots**: Refer to an `itemId` from the Registry.

### Core Types
```typescript
interface ItemInstance {
  id: string;        // UUID
  template: string;  // Index to Atlas (e.g., "longsword")
  quantity: number;
  addedAt: number;
}

interface InventorySlot {
  id: string;
  itemId: string | null;
}
```

## Benefits
1. **Save Stability**: Changes to the "Longsword" template automatically apply to all instances.
2. **Nesting**: Items can contain other items (e.g., a Pouch inside a Backpack).
3. **Logistics**: Uniform logic for Player Inventory, Loot, and Merchants.

## Known Issues
- Migration from V1 (Array-based) to V2 is still in progress for many characters.
- Drag & Drop logic (`dnd-kit`) needs to be fully optimized for nested containers.

## TODO's
- [ ] Complete migration of all starting equipment packs to V2.
- [ ] Add weight calculation based on nested contents.
