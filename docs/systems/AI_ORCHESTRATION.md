# 🎭 AI Orchestration & The Narrator Model

## 👁️ Vision
The AI in Artificer is designed as a **Narrator, Storyteller, and Facilitator**, not as a game engine. While the LLM provides the voice and flavor of the adventure, the "heavy lifting" of core mechanics is handled by structured game code.

The game must remain **fully playable without an LLM**. The LLM's role is to enhance the experience, not to replace the rules.

## ⚖️ The Source of Truth
The **Game State** (Zustand Stores + Atlas Database) is the absolute source of truth.
- The LLM must **never** invent or alter game data (stats, inventory, health) outside of established systems.
- The LLM should rely on the game's APIs and Tools for all state changes.
- Direct text-to-state manipulation is strictly prohibited.

## 🎭 LLM Responsibilities

### 1. Narrating Events & Outcomes
The LLM translates mechanical results into immersive prose. 
- *Mechanical result:* "Roll 18, Hit, 12 Damage."
- *LLM Narration:* "Your blade finds a gap in the orc's rusted plate, biting deep into its shoulder as it bellows in pain."

### 2. Interpreting Player Intent
The LLM parses unstructured natural language from the player into discrete game actions.
- *Player:* "I want to sneak past the guards and check the chest."
- *LLM Action:* Triggers a Stealth check and moves the party marker if successful.

### 3. Executing Tool Calls
When the player requests a game action, the LLM identifies the correct tool and calls it with the appropriate context.
- Examples: `rollDice3D()`, `updateInventory()`, `triggerEncounter()`, `advanceTime()`.

### 4. Presenting Information
The LLM retrieves data from the game systems (World State, Journal, Bestiary) and presents it in a natural, atmospheric way.

### 5. System Maintenance
The LLM ensures that supporting systems like the **Quest Log**, **Journal**, and **Memory Records** are updated via tools to reflect the narrative progression.

## 🛠️ Integration Architecture
The LLM interacts with the game via a **Tool-Calling Bridge**:
1. **Request:** Player speaks to the LLM.
2. **Context:** LLM receives the current Game State (Zustand) as context.
3. **Reasoning:** LLM decides if a mechanical action is required.
4. **Action:** LLM issues a JSON Tool Call.
5. **Execution:** The Game Engine (Jimmy's code) executes the tool and updates the state.
6. **Narration:** LLM receives the tool result and narrates the outcome.

## 🚫 Prohibited Behaviors
- **Hallucinating Stats:** Inventing HP for an enemy that doesn't exist in the Atlas.
- **Bypassing Rules:** Allowing a player to "cast a spell" without the mechanical store deducting a spell slot.
- **Altering World State:** Changing the weather or time of day without using the `WorldStore` tools.

---
*Maintained by the Artificer Project Orchestrator.*
