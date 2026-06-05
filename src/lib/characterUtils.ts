import { Character } from "../store/useStore";
import { atlasService } from "../services/atlasService";
import { XP_TABLE } from "./statCalculations";

export interface LevelUpResult {
  newLevel: number;
  newFeatures: any[];
  hpIncrease: number;
  profBonusIncrease: boolean;
  hasASI: boolean;
}

export async function processLevelUp(character: Character): Promise<{ updatedCharacter: Character; results: LevelUpResult[] } | null> {
  const currentLevel = character.level;
  const currentXp = character.xp;
  
  // Find the highest level that matches current XP
  let newLevel = currentLevel;
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (currentXp >= XP_TABLE[i]) {
      newLevel = i + 1;
      break;
    }
  }

  if (newLevel <= currentLevel) return null;

  const results: LevelUpResult[] = [];
  let workingCharacter = { ...character };
  
  // Load data for each new level gained sequentially
  for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
    const levelFeatures: any[] = [];
    const levelData = await atlasService.loadLevelData(character.class, lvl);
    
    if (levelData && levelData.features) {
      for (const featRef of levelData.features) {
          const feat = await atlasService.loadFeature(featRef.index);
          if (feat) {
              levelFeatures.push({
                  name: feat.name,
                  index: feat.index,
                  desc: Array.isArray(feat.desc) ? feat.desc.join('\n') : (feat.desc || ''),
                  source: 'Class',
                  choice: feat.choice,
                  feature_specific: feat.feature_specific,
                  full_desc: feat.desc
              });
          } else {
              levelFeatures.push({
                  name: featRef.name,
                  index: featRef.index,
                  desc: 'Feature details loading...',
                  source: 'Class'
              });
          }
      }
    }
    
    const conMod = Math.floor(((character.stats?.con || 10) - 10) / 2);
    const hitDie = levelData?.hit_die || 8;
    // Level 1: Max die + Con mod. Level 2+: Fixed (half + 1) + Con mod.
    const increase = (lvl === 1) ? (hitDie + conMod) : (Math.floor(hitDie / 2) + 1 + conMod);
    
    // Ensure minimum increase of 1
    const finalIncrease = Math.max(1, increase);
    
    const hasASI = levelFeatures.some(f => 
      f.index.includes('ability-score-improvement') || 
      f.index.includes('ability_score_improvement') ||
      f.name.toLowerCase().includes('ability score improvement')
    );

    const stepResult: LevelUpResult = {
      newLevel: lvl,
      newFeatures: levelFeatures,
      hpIncrease: finalIncrease,
      profBonusIncrease: Math.floor(2 + lvl / 4) > Math.floor(2 + (lvl - 1) / 4),
      hasASI
    };

    results.push(stepResult);

    // Update working character for the next iteration
    workingCharacter = {
      ...workingCharacter,
      level: lvl,
      maxHp: workingCharacter.maxHp + finalIncrease,
      hp: workingCharacter.hp + finalIncrease,
      features: [...workingCharacter.features, ...levelFeatures]
    };
  }

  return {
    updatedCharacter: { ...workingCharacter, xp: currentXp },
    results
  };
}
