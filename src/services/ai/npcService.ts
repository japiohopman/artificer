import { ai, MODELS } from "./config";
import { getXPForLevel } from "../../lib/npcGeneratorUtils";
import { ATLAS_TRAITS } from "../../lib/atlasTraits";

export interface NPCProfile {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  class: string;
  race: string;
  background: string;
  alignment: string;
  level: number;
  xp: number;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  proficiencies: string[];
  backstory: string;
  flaws: string[];
  ideals: string[];
  bonds: string[];
  traits: string[];
  features: { name: string; index: string; desc: string; source: string }[];
  skills: string[];
  voiceProfile?: string;
  appearance: {
    hairColor: string;
    hairStyle: string;
    bodyType: string;
    eyeColor: string;
    skinColor: string;
    height: string;
    weight: string;
  };
  money: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  inventory: Record<string, any | null>;
  backpack: any[];
  items?: Record<string, any>;
  containers?: Record<string, any>;
  equipment?: { containerId: string, slots: any[] };
  spells: any[];
  choices?: Record<string, string[]>;
  hp: number;
  maxHp: number;
  imageUrl?: string;
  avatarUrl?: string;
  matrixUrl?: string;
  saveVersion?: number;
}

export async function generateNPCData(
  partial: Partial<NPCProfile>, 
  context?: { 
    speciesList?: string[];
    classList?: string[];
    backgroundList?: string[];
    alignmentList?: string[];
    statGenMethod?: 'Standard Array' | 'Rolling' | 'Point Buy';
  }
): Promise<NPCProfile> {
  const statRule = context?.statGenMethod === 'Standard Array' 
    ? 'ABILITY SCORES: Use the Standard Array [15, 14, 13, 12, 10, 8]. Assign these to stats by prioritizing class needs.'
    : context?.statGenMethod === 'Point Buy'
    ? 'ABILITY SCORES: Use Point Buy (max 15, min 8). Spend 27 points. Prioritize class needs.'
    : 'ABILITY SCORES: Use "4d6 drop lowest" rule (range 3-18). Prioritize scores based on class (e.g. Wizard needs INT, Fighter needs STR/CON).';

  const prompt = `You are a professional RPG NPC Orchestrator for the "Artificer" game system. 
  Your job is NOT to invent data, but to SELECT existing data indices and ORCHESTRATE the character profile.

  DATA INVENTORY (Pick ONLY from these indices):
  SPECIES: ${context?.speciesList?.join(', ') || 'Human, Elf, Dwarf, Halfling, Half-Orc, Dragonborn, Gnome, Half-Elf, Tiefling'}
  CLASSES: ${context?.classList?.join(', ') || 'Fighter, Wizard, Rogue, Cleric, Paladin, Ranger, Barbarian, Bard, Druid, Monk, Sorcerer, Warlock'}
  BACKGROUNDS: ${context?.backgroundList?.join(', ') || 'Acolyte, Soldier, Noble, Sage, Criminal, Folk Hero, Entertainer, Guild Artisan, Hermit, Outlander, Sailor, Urchin'}
  ALIGNMENTS: ${context?.alignmentList?.join(', ') || 'Lawful Good, Neutral Good, Chaotic Good, Lawful Neutral, True Neutral, Chaotic Neutral, Lawful Evil, Neutral Evil, Chaotic Evil'}

  CHARACTER CREATION PIPELINE RULES:
  1. SPECIES SELECTION: Choose one Species index from the list.
  2. CLASS SELECTION: Choose one Class index.
  3. BACKGROUND SELECTION: Choose one Background index.
  4. ALIGNMENT SELECTION: Choose one Alignment index.
  5. ${statRule}
  6. APPEARANCE PROFILE: Describe the character in detail. 
     - skin_color: A valid Hexadecimal string (e.g. "#ecd1b0").
     - size: "Small", "Medium", or "Large".
     - hair_style: e.g. "Long and braided", "Short and messy".
     - hair_color: e.g. "Crimson red", "Silver white".
     - build: e.g. "Muscular", "Slender", "Sturdy".
     - eye_color: e.g. "Emerald green".
  7. BACKSTORY: 1-3 paragraphs.
  8. VOICE: Define a voiceProfile (e.g. "Raspy, deep, authoritative", "High-pitched, nervous", etc).

  Initial Seeds:
  Name: ${partial.name || 'Random'}
  Gender: ${partial.gender || 'Random'}
  Class Hint: ${partial.class || 'Any'}
  Race Hint: ${partial.race || 'Any'}
  Level: ${partial.level || 1}

  JSON SCHEMA:
  Return the selected indices and flavor text. The core mechanical resolution (AC, HP, inventory expansion) will be handled by the pipeline code based on the indices you pick.
  
  Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          gender: { type: "STRING", enum: ["Male", "Female"] },
          class: { type: "STRING" },
          race: { type: "STRING" },
          background: { type: "STRING" },
          alignment: { type: "STRING" },
          level: { type: "NUMBER" },
          xp: { type: "NUMBER" },
          stats: {
            type: "OBJECT",
            properties: {
              str: { type: "NUMBER" },
              dex: { type: "NUMBER" },
              con: { type: "NUMBER" },
              int: { type: "NUMBER" },
              wis: { type: "NUMBER" },
              cha: { type: "NUMBER" },
            },
            required: ["str", "dex", "con", "int", "wis", "cha"]
          },
          proficiencies: { type: "ARRAY", items: { type: "STRING" } },
          backstory: { type: "STRING" },
          flaws: { type: "ARRAY", items: { type: "STRING" } },
          ideals: { type: "ARRAY", items: { type: "STRING" } },
          bonds: { type: "ARRAY", items: { type: "STRING" } },
          traits: { type: "ARRAY", items: { type: "STRING" } },
          features: { type: "ARRAY", items: { type: "STRING" } },
          voiceProfile: { type: "STRING" },
          appearance: {
            type: "OBJECT",
            properties: {
              hair_color: { type: "STRING" },
              hair_style: { type: "STRING" },
              build: { type: "STRING" },
              eye_color: { type: "STRING" },
              skin_color: { type: "STRING" },
              size: { type: "STRING" },
              height: { type: "STRING" },
              weight: { type: "STRING" },
            }
          },
          money: {
            type: "OBJECT",
            properties: {
              gp: { type: "NUMBER" }
            }
          }
        }
      }
    }
  });

  const baseData = JSON.parse(response.text);
  
  // Normalize appearance keys to original CamelCase if needed by UI, 
  // but keeping user's preferred snake_case as well
  const appearance = {
    ...baseData.appearance,
    skinColor: baseData.appearance?.skin_color || baseData.appearance?.skinColor || "#ffffff",
    hairColor: baseData.appearance?.hair_color || baseData.appearance?.hairColor || "Black",
    hairStyle: baseData.appearance?.hair_style || baseData.appearance?.hairStyle || "Standard",
    eyeColor: baseData.appearance?.eye_color || baseData.appearance?.eyeColor || "Brown",
    bodyType: baseData.appearance?.build || baseData.appearance?.bodyType || "Medium",
    size: baseData.appearance?.size || "Medium"
  };

  // Generate random money between 5 and 100 gp
  const totalGp = Math.floor(Math.random() * 96) + 5;
  
  // Return consistent structure for further processing
  return {
    ...baseData,
    appearance,
    inventory: {},
    backpack: [],
    spells: [],
    hp: 10,
    maxHp: 10,
    money: { cp: 0, sp: 0, ep: 0, gp: totalGp, pp: 0 }
  };
}

export async function generateNPCImages(npc: NPCProfile): Promise<{ profileUrl: string; avatarUrl: string; matrixUrl: string }> {
  const greenScreenRule = `
    CRITICAL BACKGROUND RULE: 
    - The background MUST be a 100% solid, flat, matte, uniform chroma key green (#00FF00) from edge to edge.
    - THE SUBJECT MUST BE THE ONLY THING IN THE IMAGE.
    - NO floors, NO walls, NO arches, NO ceilings, NO furniture, NO props, NO environment.
    - NO shadows on the background, NO gradients, NO lighting effects on the background.
    - NO VIGNETTE, NO BORDERS, NO FRAME, NO EDGE DARKENING, NO CORNER SHADOWS.
    - The green background must be perfectly uniform with no lighting falloff.
    - The subject should appear as if it is floating in a pure, flat green digital void.
  `;

  const commonCharacterDesc = `
    Character Details:
    Name: ${npc.name}
    Gender: ${npc.gender}
    Race: ${npc.race}
    Class: ${npc.class}
    Appearance: ${npc.appearance.hairStyle} ${npc.appearance.hairColor} hair, ${npc.appearance.eyeColor} eyes, ${npc.appearance.bodyType} build, skin tone hex ${npc.appearance.skinColor}.
    Vibe: ${npc.alignment} ${npc.background}.
    Art Style: Cinematic, high-fidelity digital painting, Baldur's Gate 3 / Classic D&D style, gritty texture, dramatic lighting.
  `;

  const profilePrompt = `A high-quality 9:16 vertical character portrait of an NPC.
  The hero stands with the body slightly tilted to the right, looking towards the camera.
  ${commonCharacterDesc}
  ${greenScreenRule}`;

  const avatarPrompt = `A 1:1 square close-up face portrait / avatar of an NPC.
  Head shot looking straight forward into the camera.
  ${commonCharacterDesc}
  ${greenScreenRule}`;

  const matrixSkillInstruction = `
    Generate a high-quality 2D character sheet. The image MUST be a strictly organized grid of THREE COLUMNS AND THREE ROWS, containing EXACTLY 9 individual portrait cells. 
    Aspect Ratio: 3:2 (Landscape).
    DO NOT generate 4 columns. DO NOT generate 12 cells.
    Use a solid, flat, vibrant chroma-key green background (#00FF00) for every cell. 
    Ensure the character is framed from the waist up, and their body is grounded at the bottom of each cell frame with no empty space or borders beneath them.
    The grid must follow this specific order of emotions across the cells:
    1. Top-Left: Neutral
    2. Top-Center: Curious
    3. Top-Right: Skeptical
    4. Middle-Left: Happy
    5. Middle-Center: Greedy
    6. Middle-Right: Angry
    7. Bottom-Left: Sad
    8. Bottom-Center: Surprised
    9. Bottom-Right: Proud
    
    Negative Prompt: 4 columns, 5 columns, 6 columns, 4x3 grid, 4x4 grid, 12 cells, 16 cells, white outlines, white borders, white margins, white background, clipped hair, clipped shoulders, shields exiting frame, weapons exiting frame, green spill on skin, green reflections, green tint in hair, multiple characters in one cell, text, labels, watermarks, full body, floating, inconsistent features, messy layout, gradients in background, shadows on background, vignette, shadows on green, dark edges.
  `;

  const matrixPrompt = `
    NPC EMOTION MATRIX (3x3 grid, 9 cells).
    ${commonCharacterDesc}
    ${matrixSkillInstruction}
    ${greenScreenRule}
  `;

  // Profile Image (9:16)
  const profileRes = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: profilePrompt,
    config: {
      imageConfig: {
        aspectRatio: "9:16"
      }
    }
  });

  // Avatar Image (1:1)
  const avatarRes = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: avatarPrompt,
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  // Matrix Image (3:2)
  const matrixRes = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: matrixPrompt,
    config: {
      imageConfig: {
        aspectRatio: "3:2"
      }
    }
  });

  let profileUrl = '';
  let avatarUrl = '';
  let matrixUrl = '';

  for (const part of profileRes.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      profileUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  for (const part of avatarRes.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      avatarUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  for (const part of matrixRes.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      matrixUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return { profileUrl, avatarUrl, matrixUrl };
}
