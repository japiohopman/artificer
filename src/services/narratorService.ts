import { ai, MODELS } from './ai/config';
import { useChatStore } from '../store/useChatStore';
import { useWorldStore } from '../store/useWorldStore';
import { useCharacterStore } from '../store/useCharacterStore';
import { useGameStore } from '../store/useGameStore';
import { useUIStore } from '../store/useUIStore';

export const narratorService = {
  async generateResponse(userPrompt: string) {
    const chatStore = useChatStore.getState();
    const worldStore = useWorldStore.getState();
    const characterStore = useCharacterStore.getState();
    const gameStore = useGameStore.getState();
    const uiStore = useUIStore.getState();

    chatStore.setThinking(true);
    chatStore.addMessage({ role: 'user', content: userPrompt });

    try {
      // 1. Construct "Reality Snapshot" (Efficiently condensed state)
      const activeChar = characterStore.characters.find(c => c.id === characterStore.activeCharacterId);
      const realitySnapshot = {
        world: {
          time: `${worldStore.gameTime} on ${worldStore.gameDay} of ${worldStore.gameMonth}`,
          weather: worldStore.weather,
          location: worldStore.currentLocation?.name,
          region: worldStore.region
        },
        party: {
          active_char: activeChar ? {
            name: activeChar.name,
            hp: `${activeChar.hp}/${activeChar.maxHp}`,
            level: activeChar.level,
            class: activeChar.class
          } : null
        },
        gameMode: uiStore.gameMode,
        combat: uiStore.gameMode === 'combat' ? {
          player_pos: gameStore.combatState.playerPos,
          active_turn: gameStore.combatState.initiativeOrder[gameStore.combatState.activeTurnIndex]?.name,
          monsters: gameStore.combatState.monsters.map(m => ({ name: m.name, hp: m.hp, pos: { x: m.x, y: m.y }, awareness: m.awareness }))
        } : null
      };

      const systemPrompt = `
You are the Narrator and Dungeon Master for an immersive Dungeons & Dragons adventure in Faerûn.
Your role is to translate game mechanics into immersive prose and facilitate the adventure.

CRITICAL RULES:
1. You are a NARRATOR. Do not invent game stats. Use the provided Reality Snapshot as the absolute source of truth.
2. If a player wants to do something mechanical (attack, move, search), you should use TOOL CALLS (simulated for now via text responses until actual tools are wired).
3. Keep responses immersive, but concise. Avoid long monologues unless requested.
4. Current Reality Snapshot (JSON): ${JSON.stringify(realitySnapshot)}

Style: Immersive, skeuomorphic, reminiscent of Baldur's Gate 3.
      `.trim();

      // 2. Build Contents for Gemini
      const history = chatStore.getHistoryForAI();
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...history,
        { role: 'user', parts: [{ text: userPrompt }] }
      ];

      // 3. Call AI
      const result = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents,
        config: {
          temperature: 0.7,
          maxOutputTokens: 500,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "setGameMode",
                  description: "Changes the game mode between exploration and combat.",
                  parameters: {
                    type: "OBJECT",
                    properties: {
                      mode: { type: "STRING", enum: ["exploration", "combat"] }
                    },
                    required: ["mode"]
                  }
                },
                {
                  name: "rollDice3D",
                  description: "Rolls 3D dice on the screen.",
                  parameters: {
                    type: "OBJECT",
                    properties: {
                      notation: { type: "STRING", description: "Standard dice notation like '1d20+5' or '2d6'" },
                      label: { type: "STRING", description: "A label for the roll, like 'Sword Attack'" }
                    },
                    required: ["notation", "label"]
                  }
                },
                {
                  name: "toggleDoor",
                  description: "Opens or closes a door at the specified coordinates on the tactical grid.",
                  parameters: {
                    type: "OBJECT",
                    properties: {
                      x: { type: "NUMBER" },
                      y: { type: "NUMBER" }
                    },
                    required: ["x", "y"]
                  }
                },
                {
                  name: "spawnMonster",
                  description: "Spawns a monster onto the tactical grid from the atlas registry.",
                  parameters: {
                    type: "OBJECT",
                    properties: {
                      index: { type: "STRING", description: "The index/slug of the monster, e.g., 'goblin' or 'worg'" },
                      x: { type: "NUMBER", description: "The X coordinate (0-11)" },
                      y: { type: "NUMBER", description: "The Y coordinate (0-7)" }
                    },
                    required: ["index"]
                  }
                }
              ]
            }
          ]
        }
      });

      // 4. Handle Tool Calls
      const call = result.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall);
      if (call) {
        const { name, args } = call.functionCall;
        console.log(`[Narrator] Tool Call: ${name}`, args);

        switch (name) {
          case 'setGameMode':
            uiStore.setGameMode(args.mode);
            break;
          case 'rollDice3D':
            await gameStore.rollDice3D(args.notation, args.label);
            break;
          case 'toggleDoor':
            gameStore.toggleDoor(args.x, args.y);
            break;
          case 'spawnMonster':
            await gameStore.spawnMonster(args.index, args.x, args.y);
            break;
        }

        // After a tool call, we might want to get a final narration
        // For now, just summarize the action as assistant message or re-call AI
        chatStore.addMessage({ role: 'user', content: userPrompt });
        chatStore.addMessage({ role: 'assistant', content: `*Executes ${name}...*` });
        return `*Executes ${name}...*`;
      }

      const responseText = result.text;

      // 5. Update Store
      if (responseText) {
        chatStore.addMessage({ role: 'assistant', content: responseText });
      }

      return responseText;
    } catch (error) {
      console.error("Narrator Error:", error);
      chatStore.addMessage({ role: 'system', content: "The mists of the Weave flicker... The Narrator is momentarily unreachable." });
      throw error;
    } finally {
      chatStore.setThinking(false);
    }
  }
};
