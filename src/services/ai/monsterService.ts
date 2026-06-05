import { Type } from "@google/genai";
import { ai, MODELS } from "./config";

export interface MonsterStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface MonsterAction {
  name: string;
  desc: string;
  attack_bonus?: number;
  damage_dice?: string;
  damage_bonus?: number;
}

export interface Monster {
  id?: string;
  name: string;
  index: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: number;
  hit_points: number;
  hit_dice: string;
  speed: string | { [key: string]: string | number };
  stats: MonsterStats;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';
  challenge_rating: string;
  actions: MonsterAction[];
  item_drops?: { name: string; rarity: string; quantity: string; type?: 'material' | 'currency' | 'equipment' }[];
  background_type?: string;
  special_abilities: { name: string; desc: string }[];
  legendary_actions?: { name: string; desc: string }[];
  reactions?: { name: string; desc: string }[];
  senses?: string;
  languages?: string;
  lore?: string;
  xp?: number;
  imageUrl?: string;
  image_url?: string;
  image?: string;
  card_color?: string;
  proficiencies?: any[];
  wikiData?: any;
  last_updated?: string;
  updated_at?: string;
  damage_vulnerabilities?: string[];
  damage_resistances?: string[];
  damage_immunities?: string[];
  condition_immunities?: (string | { name: string; [key: string]: any })[];
}

export async function parseRawMonsterText(text: string): Promise<Partial<Monster> | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: `You are an expert D&D 5e (2014 & 2024/2025/2025 Core Rules) Monster Statblock Interpreter.
      
      TASK: Extract ALL statistical data from the Provided Raw Text into a structured JSON.
      
      CRITICAL INSTRUCTION:
      - STRICTLY FOLLOW THE PROVIDED TEXT. Do not hallucinate stats from your general knowledge if they differ from the text.
      - Handle the 2024/2025 format where stats are listed as "Stat Value Modifier Save" (e.g., "Str 8 -1 -1").
      - Handle Initiative being explicitly listed (e.g., "Initiative +0 (10)").
      - Map "Melee Attack Roll" or "Ranged Attack Roll" into the "actions" array.
      - Extract "Traits" or descriptions before Actions into "special_abilities".
      - Extract "Bonus Actions" into a "bonus_actions" array (if present).
      - Extract "Reactions" into a "reactions" array (if present).
      - Extract "Legendary Actions" into a "legendary_actions" array (if present).
      - Extract "Skills" (e.g., "Stealth +4") into a "skills" array or object.
      - Extract "size", "type", "subtype", and "alignment" from the first few lines of text.
      
      EXTRACTED DATA SCHEMA:
      {
        "name": "string",
        "index": "lowercase-slug",
        "size": "Tiny|Small|Medium|Large|Huge|Gargantuan",
        "type": "string",
        "subtype": "string",
        "alignment": "string",
        "armor_class": number,
        "armor_desc": "string (e.g. natural armor)",
        "hit_points": number,
        "hit_dice": "string",
        "speed": "string or object",
        "initiative": number,
        "stats": { "str": 8, "dex": 10, "con": 10, "int": 8, "wis": 11, "cha": 5 },
        "challenge_rating": "string",
        "xp": number,
        "senses": "string",
        "languages": "string",
        "skills": "string (e.g. Stealth +4, Perception +2)",
        "habitat": "string",
        "treasure": "string",
        "special_abilities": [{ "name": "string", "desc": "string" }],
        "actions": [{ "name": "string", "desc": "string" }],
        "bonus_actions": [{ "name": "string", "desc": "string" }],
        "reactions": [{ "name": "string", "desc": "string" }],
        "legendary_actions": [{ "name": "string", "desc": "string" }],
        "lore": "string (atmospheric summary if present)",
        "background_type": "One of [air, water, land_forest, land_urban, land_plains, land_mountains, jungle, desert, underdark, beach, church, castle, fort, ruins, cave, snowy, swamp, dragon_cave, fey]"
      }

      RAW TEXT TO PARSE:
      """
      ${text}
      """`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            index: { type: Type.STRING },
            size: { type: Type.STRING },
            type: { type: Type.STRING },
            subtype: { type: Type.STRING },
            alignment: { type: Type.STRING },
            armor_class: { type: Type.INTEGER },
            armor_desc: { type: Type.STRING },
            hit_points: { type: Type.INTEGER },
            hit_dice: { type: Type.STRING },
            speed: { type: Type.STRING },
            initiative: { type: Type.INTEGER },
            stats: {
              type: Type.OBJECT,
              properties: {
                str: { type: Type.INTEGER },
                dex: { type: Type.INTEGER },
                con: { type: Type.INTEGER },
                int: { type: Type.INTEGER },
                wis: { type: Type.INTEGER },
                cha: { type: Type.INTEGER },
              }
            },
            rarity: { type: Type.STRING, enum: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'] },
            card_color: { type: Type.STRING },
            background_type: { type: Type.STRING },
            challenge_rating: { type: Type.STRING },
            xp: { type: Type.INTEGER },
            senses: { type: Type.STRING },
            languages: { type: Type.STRING },
            skills: { type: Type.STRING },
            habitat: { type: Type.STRING },
            treasure: { type: Type.STRING },
            item_drops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  rarity: { type: Type.STRING },
                  quantity: { type: Type.STRING }
                }
              }
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                }
              }
            },
            special_abilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                }
              }
            },
            bonus_actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                }
              }
            },
            reactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                }
              }
            },
            legendary_actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                }
              }
            },
            lore: { type: Type.STRING }
          },
          required: ["name", "index", "stats"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    
    // Auto-calculate XP if missing but CR is present
    if (parsed.challenge_rating && !parsed.xp) {
      const crMap: Record<string, number> = {
        "0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800
      };
      parsed.xp = crMap[parsed.challenge_rating] || 0;
    }

    return parsed;
  } catch (error) {
    console.error("Error parsing monster text:", error);
    return null;
  }
}

export async function generateLore(name: string, type: string, size?: string, alignment?: string, subtype?: string, url?: string): Promise<string> {
  try {
    const monsterDetails = `a ${size || ""} ${alignment || ""} ${type} ${subtype ? `(${subtype})` : ""}`;
    
    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: `Write a short, atmospheric, dark fantasy lore snippet (2-3 sentences) for a D&D monster named "${name}", which is ${monsterDetails}. 
      The tone should be serious, adult-themed, and cinematic, like Baldur's Gate 3 or classic D&D.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating lore:", error);
    return "";
  }
}

export function getPredictedWikiUrl(name: string): string {
  // Common pattern for Forgotten Realms fandom
  const cleanName = name.replace(/\s+/g, '_').replace(/'/g, '%27');
  return `https://forgottenrealms.fandom.com/wiki/${cleanName}`;
}

export async function scrapeMonsterWiki(name: string, wikiUrl?: string): Promise<{ lore: string; wikiData: any } | null> {
  console.log(`[WikiScraper] Starting scrape for: ${name}`);
  try {
    let apiUrl = "";
    const nameForApi = name.replace(/\s+/g, '_');

    if (wikiUrl && wikiUrl.includes('fandom.com/wiki/')) {
      const baseUrl = wikiUrl.split('/wiki/')[0];
      const pageTitle = wikiUrl.split('/wiki/')[1];
      apiUrl = `${baseUrl}/api.php?action=parse&page=${pageTitle}&format=json&prop=text|sections`;
    } else {
      apiUrl = `https://forgottenrealms.fandom.com/api.php?action=parse&page=${nameForApi}&format=json&prop=text|sections`;
    }

    console.log(`[WikiScraper] Fetching via MediaWiki API: ${apiUrl}`);
    
    const proxyUrl = `/api/proxy-wiki?url=${encodeURIComponent(apiUrl)}`;
    const fetchRes = await fetch(proxyUrl);
    
    if (!fetchRes.ok) {
      console.error(`[WikiScraper] API fetch failed with status: ${fetchRes.status}`);
      // Fallback to basic scraping if API fails
      const fallbackUrl = wikiUrl || getPredictedWikiUrl(name);
      return scrapeBasicHtml(name, fallbackUrl);
    }
    
    const apiData = await fetchRes.json();
    if (!apiData.parse || !apiData.parse.text) {
      console.warn("[WikiScraper] API returned no content, falling back to basic scrape");
      return scrapeBasicHtml(name, wikiUrl || getPredictedWikiUrl(name));
    }

    const html = apiData.parse.text["*"];
    const cleanContent = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, "")
                             .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gim, "")
                             .replace(/<[^>]*>/g, " ");

    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: `Extract D&D lore sections from the following Wiki text for "${name}". 
      Focus on these potential areas: Description, Personality, Powers, Rituals, Realms, History, Weaknesses.
      
      Structure: JSON object with keys as section names.
      Include 'mainLore': a beautifully written 2-3 paragraph atmospheric summary for players.
      
      Content:
      ${cleanContent.substring(0, 15000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainLore: { type: Type.STRING },
            sections: { type: Type.OBJECT }
          }
        }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      lore: data.mainLore || "",
      wikiData: data.sections || {}
    };
  } catch (error) {
    console.error("[WikiScraper] API Error:", error);
    return scrapeBasicHtml(name, wikiUrl || getPredictedWikiUrl(name));
  }
}

async function scrapeBasicHtml(name: string, url: string): Promise<{ lore: string; wikiData: any } | null> {
  console.log(`[WikiScraper] Falling back to basic HTML scrape for: ${url}`);
  try {
    const proxyUrl = `/api/proxy-wiki?url=${encodeURIComponent(url)}`;
    const fetchRes = await fetch(proxyUrl);
    if (!fetchRes.ok) return null;
    
    const html = await fetchRes.text();
    const cleanText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, "")
                          .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gim, "")
                          .replace(/<[^>]*>/g, " ");

    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: `Synthesize D&D lore from this text for "${name}". 
      Return JSON with 'mainLore' (atmospheric summary) and 'sections' (structured data).
      Text: ${cleanText.substring(0, 8000)}`,
      config: { responseMimeType: "application/json" }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      lore: data.mainLore || data.lore || "",
      wikiData: data.sections || data.wikiData || {}
    };
  } catch (e) {
    return null;
  }
}
