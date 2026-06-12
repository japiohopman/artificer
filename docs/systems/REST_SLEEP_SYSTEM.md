# 💤 Rest & Sleep System

The **Rest & Sleep System** manages the recovery of resources and the prevention of exhaustion.

## 🧩 Mechanics

### 1. Short Rest (1 Hour)
- Allows characters to spend Hit Dice to recover HP.
- Restores class-specific resources (e.g., Warlock spell slots, Fighter's Second Wind).

### 2. Long Rest (8 Hours)
- Restores all HP and half of maximum Hit Dice.
- Restores all spell slots and long-term abilities.
- Requires at least 6 hours of sleep and 2 hours of light activity (e.g., keeping watch).

### 3. Exhaustion
- If a character skips a Long Rest in a 24-hour period, they must succeed on a DC 10 Constitution save or gain 1 level of Exhaustion.
- Forced March: Traveling beyond 8 hours a day requires hourly saves against exhaustion.

### 4. Locations & Safety
- **Settlements/Inns**: 100% safety. Full recovery. Costs gold.
- **Wilderness/Dungeons**: Risk of interruptions. Requires a "Watch Order" (Party State). Random encounters during rest can cancel the benefits.

## 🔄 Integration
- **Character Store**: Updates `hp` and `spellSlots`.
- **World Store**: Advances `gameTime` by 1 or 8 hours.
- **UI**: Triggered via the `PartyStatus` sub-component in the World Panel.
