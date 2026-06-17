# 📜 Journal Module (`Journal.tsx`)

The **Journal** acts as the central memory of the campaign, combining a diary, quest log, bestiary, and lore library. It is designed to be a permanent record for both the player and the AI Dungeon Master.

## 🧩 Key Systems

### 1. Daily Summary (LLM Component)
The Journal contains an LLM-driven component that automatically generates a summary when the player completes a **Long Rest**.

**Objectives**:
- Provide the player with an overview of the day's events.
- Serve as permanent memory storage when the AI's context or memory cache becomes full.

**Content includes**:
- Significant events and choices.
- Key conversations.
- Discovered locations and new NPCs.
- Important battles.
- Items acquired, used, or lost.
- Changes in relationships or reputation.
- Current mission progress.

**Closing Summary**:
Each daily summary must conclude with the group's current goal, active mission, location, and the next logical step.

### 2. Quest Log
Quest information is clearly separated from the diary and categorized for quick scanning.

**Categories**:
- **Main Quests**: Primary story missions impacting the main storyline.
- **Side Quests**: Optional missions with independent storylines and rewards.
- **Tasks**: Small objectives (collections, errands, NPC requests, deliveries, research).

**Data Points**:
- Title and Description.
- Status: `Active`, `Completed`, `Failed`, `Abandoned`.
- Last Update timestamp.
- Involved NPCs and Rewards.

### 3. Bestiary
A repository of all previously encountered creatures.
- Displays: Name, Type, Challenge Rating, Description, and Stat Block.
- Reuses existing **Enemy Card** components.

### 4. Lore Codex
Displays all unlocked lore, sourced from Markdown files in `public/assets/atlas/lore/` (e.g., `essays/`, `geography/`, `gods/`).

**Rendering**:
- Uses the same Markdown rendering as enemy sheets.
- Supports headers, tables, quotes, callouts, images, and internal links.

## 🎨 UI & Layout
The Journal is designed to feel like an authentic D&D campaign journal.

### Typography
- **Diary Style**: Decorative fantasy fonts (e.g., *Cinzel*, *Cormorant Garamond*, *Uncial Antiqua*) for day titles, chapters, and summaries.
- **Quest Log**: Highly legible UI fonts for missions, tasks, and status information to ensure quick scannability.

## 🤖 AI Context Recovery
When the AI loses context or exceeds its memory cache, the Dungeon Master can automatically fall back on the Journal's data:
1. Last daily summary.
2. Active Main and Side Quests.
3. Important NPCs.
4. Last known location.
5. Recent lore discoveries.

This ensures narrative consistency even during very long campaigns.

---
*Status: Architecture Defined. Implementation Pending.*
