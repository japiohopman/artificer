# ⚔️ Quest System Architecture

The Quest System is designed to provide structure to the campaign while remaining flexible enough for AI-driven narration. It bridges the gap between the mechanical Atlas (static data) and the dynamic Campaign Journal (persistent state).

## 1. Data Structure

### 📜 Quest Templates (`public/assets/atlas/quests/`)
Quests are defined as JSON files following the `quest.schema.json`.

```json
{
  "index": "the_lost_mine",
  "title": "The Lost Mine of Phandelver",
  "category": "Main",
  "giver": "gundren-rockseeker",
  "requirements": {
    "level": 1,
    "location": "neverwinter"
  },
  "stages": [
    {
      "id": "ambush",
      "description": "Survive the goblin ambush on the High Road.",
      "status": "Incomplete"
    },
    {
      "id": "cragmaw_hideout",
      "description": "Find the entrance to the goblin hideout.",
      "status": "Incomplete"
    }
  ],
  "rewards": {
    "xp": 500,
    "items": ["sunblade"]
  }
}
```

### 🗝️ Quest Items
Quest items are standard items in the `equipment` atlas but with the `is_quest_item: true` flag. This prevents them from being sold or dropped accidentally.

## 2. Dynamic Progression
Quests in Artificer are processed in three ways:

1.  **Static Progression**: Defined in the JSON template. Completed when specific mechanical conditions are met (e.g., item acquired, enemy defeated).
2.  **AI-Inferred Progression**: The AI DM analyzes the session summary and uses the `updateQuestStatus` tool to move a quest to the next stage based on narrative events.
3.  **Procedural Quests**: The AI DM can generate temporary quest objects for "Tasks" or "Side Quests" that are not in the static Atlas, which are then saved directly into the character's campaign state.

## 3. Storage & State
- **Templates**: Reside in the Atlas (Read-only at runtime).
- **Instance State**: Resides in `useJournalStore.ts` (Persistent in character save).
  - Tracks which stage is active.
  - Tracks custom narrative notes added by the AI.

## 4. UI/UX (The Journal)
- **Quest Log**: Visualizes the active stages and objectives.
- **Completed**: Moves to an archive section for historical reference.
- **Failed/Abandoned**: Marked clearly to show the branching path of the story.

---
*Note: This architecture ensures that quests are both mechanically solid (for the engine) and narratively rich (for the AI).*
