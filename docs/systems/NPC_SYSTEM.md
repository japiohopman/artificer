# NPC Interactions: Schema and System Report

This document outlines the schema for Non-Player Characters (NPCs) and their interactions within the Toril Atlas. The goal is to move from static data files to a dynamic, reactive system powered by AI-driven dialogue and persistent state.

## 1. Technical Architecture

### Divided State Strategy
We implement a two-tier data model to balance global lore with personal player progression:

*   **Global NPC Registry (`public/assets/atlas/characters/npc/`)**: Stores immutable lore, physical descriptions, and base statistics. This ensures consistency across all users.
*   **User-Specific Interactions**: Stores the "state" of the relationship between that specific player and the NPC. This includes reputation, unlocked dialogue branches, and history. (Planned for Firestore integration).

### AI Integration Loop
The schema is designed to be "AI-Ready." By storing structured `personalityTraits`, `secrets`, and `goals`, we can pass these as context to the AI during live interactions, ensuring the NPC's voice remains consistent and lore-accurate.

## 2. Design Philosophy

### Persistence & Reactivity
The system allows for immediate UI updates when a relationship status changes (e.g., an NPC becomes "Hostile" after a failed theft). It also ensures that a player's progress is saved across sessions.

### Scalability
By separating interaction state into user-specific data, we avoid massive document sizes. Even if a player talks to 10,000 NPCs, the primary world data remains lightweight.

### Emergent Lore
The `history` field in the interaction schema allows the AI to reference previous encounters, making the world feel alive and reactive to player choices.

---

## 3. Schema Definitions

### NPC Global Entity (Atlas Data)
Stored in `public/assets/atlas/characters/npc/*.json` and validated against `public/assets/atlas/schemas/npc.schema.json`.

```json
{
  "id": "string",
  "name": "string",
  "species": "string",
  "classJob": "string",
  "gender": "male | female | non-binary | unknown",
  "baseMood": "Emotion",
  "visualTraits": {
    "skinTone": "string",
    "hairStyle": "string",
    "clothingStyle": "string",
    "distinguishingFeatures": "string"
  },
  "personalityTraits": ["string"],
  "secrets": ["string"],
  "goals": ["string"],
  "locationId": "string (ref to Cities/Settlements)",
  "factionId": "string (optional)",
  "isEssential": "boolean",
  "stats": {
    "str": "number",
    "dex": "number",
    "con": "number",
    "int": "number",
    "wis": "number",
    "cha": "number"
  },
  "backstory": "string"
}
```

### NPC Interaction Entity (User State)
*To be implemented in Firestore/Save System.*

```json
{
  "npcId": "string",
  "reputation": "number (-100 to 100)",
  "relationshipStatus": "Strangers | Acquaintances | Friends | Allies | Rivals | Enemies",
  "dialogueHistory": [
    {
      "timestamp": "timestamp",
      "playerMessage": "string",
      "npcResponse": "string",
      "emotionAtTime": "Emotion"
    }
  ],
  "unlockedLore": ["string"],
  "metAt": "timestamp",
  "lastInteractionAt": "timestamp"
}
```

## 4. Expected Outcomes
1. **Dynamic Emotional Arcs**: NPCs can shift moods based on the `reputation` score.
2. **Personalized Quests**: NPCs can offer different tasks based on the `relationshipStatus`.
3. **Lore-Consistent Dialogue**: AI agents can strictly follow `secrets` and `goals` stored in the Global NPC Document.
