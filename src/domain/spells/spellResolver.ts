import { diceService } from '../../dice_roller/diceService';
import { useCharacterStore } from '../../store/useCharacterStore';
import { useGameStore } from '../../store/useGameStore';

export interface CombatSpellAction {
  id: string;
  name: string;
  category: 'Spells';
  actionType: 'actions' | 'bonusActions' | 'reactions';
  description?: string;
  data: {
    index: string;
    level: number;
    range?: string;
    area_of_effect?: {
      type: string;
      size: number;
    };
    damage?: any;
    heal_at_slot_level?: Record<string, string>;
    dc?: {
      dc_type?: { index: string; name: string };
      dc_success?: string;
    };
    spell_attack?: boolean;
    casting_time?: string;
  };
}

export interface SpellExecutionResult {
  success: boolean;
  actionName: string;
  actorName: string;
  targetName: string;
  logMessage: string;
  hpChanged: number;
  hitOrSaved?: 'hit' | 'miss' | 'saved' | 'failed_save' | 'auto';
  rollTotal?: number;
}

/**
 * Creates a normalized CombatSpellAction from a canonical Atlas Spell record.
 */
export function createSpellCombatAction(spell: any): CombatSpellAction {
  const index = spell.index || spell.id || 'unknown_spell';
  const name = spell.name || 'Spell';
  const level = spell.level !== undefined ? Number(spell.level) : 0;
  const castingTime = (spell.casting_time || '').toLowerCase();

  let actionType: 'actions' | 'bonusActions' | 'reactions' = 'actions';
  if (castingTime.includes('bonus')) {
    actionType = 'bonusActions';
  } else if (castingTime.includes('reaction')) {
    actionType = 'reactions';
  }

  const descText = Array.isArray(spell.desc) ? spell.desc.join(' ') : (spell.desc || '');
  const isAttackRoll = descText.toLowerCase().includes('ranged spell attack') || descText.toLowerCase().includes('melee spell attack');

  return {
    id: index,
    name,
    category: 'Spells',
    actionType,
    description: descText,
    data: {
      index,
      level,
      range: spell.range,
      area_of_effect: spell.area_of_effect,
      damage: spell.damage,
      heal_at_slot_level: spell.heal_at_slot_level,
      dc: spell.dc,
      spell_attack: isAttackRoll,
      casting_time: spell.casting_time
    }
  };
}

/**
 * Helper to derive real spellcasting stats (modifier, attack bonus, save DC)
 * from the actor's actual stats and class metadata.
 * NO generic "highest stat wins" fallback.
 */
export function getActorSpellcastingStats(actor: any): {
  ability: 'int' | 'wis' | 'cha';
  modifier: number;
  profBonus: number;
  attackBonus: number;
  saveDC: number;
} | null {
  let ability: 'int' | 'wis' | 'cha' | null = null;

  if (actor.spellcastingAbility && ['int', 'wis', 'cha'].includes(actor.spellcastingAbility.toLowerCase())) {
    ability = actor.spellcastingAbility.toLowerCase() as 'int' | 'wis' | 'cha';
  } else if (actor.class) {
    const cls = actor.class.toLowerCase();
    if (['cleric', 'druid', 'ranger'].includes(cls)) ability = 'wis';
    else if (['sorcerer', 'warlock', 'bard', 'paladin'].includes(cls)) ability = 'cha';
    else if (['wizard', 'artificer'].includes(cls)) ability = 'int';
  }

  if (!ability) {
    return null;
  }

  const statScore = actor.stats?.[ability] ?? 10;
  const modifier = Math.floor((statScore - 10) / 2);

  const actorLevel = actor.level || 1;
  const profBonus = actor.profBonus || (1 + Math.ceil(actorLevel / 4));

  const attackBonus = modifier + profBonus;
  const saveDC = 8 + profBonus + modifier;

  return { ability, modifier, profBonus, attackBonus, saveDC };
}

/**
 * Validates castability and executes spell resolution atomically.
 * Transaction order:
 * 1. Validate actor & spell availability (known/prepared)
 * 2. Validate action economy
 * 3. Validate spell slot availability
 * 4. Resolve spell mechanic
 * 5. Apply HP/effects/state changes
 * 6. ONLY AFTER successful resolution, commit resource consumption (action + slot)
 */
export async function resolveSpellAction(
  actor: any,
  target: any,
  spellAction: CombatSpellAction,
  castLevel?: number
): Promise<SpellExecutionResult> {
  const gameStore = useGameStore.getState();
  const charStore = useCharacterStore.getState();

  const spellData = spellAction.data;
  const levelToUse = castLevel !== undefined ? castLevel : (spellData.level || 0);
  const actorName = actor?.name || 'Caster';
  const targetName = target?.name || 'Target';

  if (!actor) {
    const msg = 'No valid spellcasting actor provided.';
    gameStore.addLog(msg, 'error');
    return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
  }

  // 1. RESOLVE REAL ACTOR & SPELL AVAILABILITY
  const isPC = charStore.characters.some(c => c.id === actor.id) || actor.id === 'player';
  const realActorChar = isPC ? charStore.characters.find(c => c.id === (actor.id === 'player' ? gameStore.activeCharacterId : actor.id)) : null;

  if (isPC && realActorChar) {
    const spellIndex = spellAction.data?.index || spellAction.id;
    const isKnown = (realActorChar.knownSpells || []).some(s => s.index === spellIndex || s.id === spellIndex || s.name?.toLowerCase() === spellAction.name.toLowerCase());
    if (!isKnown) {
      const msg = `${actorName} does not know the spell ${spellAction.name}.`;
      gameStore.addLog(msg, 'error');
      return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
    }
  }

  // 2. VALIDATE ACTION ECONOMY
  if (isPC && realActorChar && realActorChar.actionEconomy) {
    const currentActions = realActorChar.actionEconomy[spellAction.actionType]?.current ?? 1;
    if (currentActions <= 0) {
      const msg = `${actorName} has no ${spellAction.actionType} remaining this turn.`;
      gameStore.addLog(msg, 'error');
      return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
    }
  }

  // 3. VALIDATE SPELL SLOT AVAILABILITY (for level > 0)
  if (levelToUse > 0) {
    if (isPC && realActorChar) {
      const slots = realActorChar.spellSlots?.[String(levelToUse)];
      if (!slots || slots.current <= 0) {
        const msg = `${actorName} has no Level ${levelToUse} spell slots remaining.`;
        gameStore.addLog(msg, 'error');
        return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
      }
    } else if (!isPC && actor.spellSlots) {
      const monsterSlots = actor.spellSlots[String(levelToUse)];
      if (!monsterSlots || monsterSlots.current <= 0) {
        const msg = `${actorName} has no Level ${levelToUse} spell slots remaining.`;
        gameStore.addLog(msg, 'error');
        return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
      }
    }
  }

  // 4. DERIVE SPELLCASTING STATS
  const spellStats = getActorSpellcastingStats(realActorChar || actor);
  if (!spellStats) {
    const msg = `Unable to determine spellcasting stats for ${actorName} (unresolved spellcasting ability).`;
    gameStore.addLog(msg, 'error');
    return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
  }

  // Helper to commit resource consumption ONLY upon successful resolution
  const commitResources = () => {
    if (isPC && realActorChar) {
      charStore.consumeAction(realActorChar.id, spellAction.actionType);
      if (levelToUse > 0) {
        charStore.castSpell(spellAction.id, levelToUse);
      }
    } else if (!isPC && actor.spellSlots && levelToUse > 0) {
      const monsterSlots = actor.spellSlots[String(levelToUse)];
      if (monsterSlots && monsterSlots.current > 0) {
        monsterSlots.current -= 1;
      }
    }
  };

  // 5. RESOLVE SPELL MECHANIC

  // HEALING SPELLS
  if (spellData.heal_at_slot_level) {
    const healFormula = spellData.heal_at_slot_level[String(levelToUse)] || spellData.heal_at_slot_level['1'];
    if (!healFormula) {
      const msg = `${spellAction.name} has no valid healing formula for Level ${levelToUse}.`;
      gameStore.addLog(msg, 'error');
      return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
    }

    const dicePart = healFormula.replace('+ MOD', '').trim();
    const roll = diceService.rollBackground(dicePart, `Healing (${spellAction.name})`);
    const totalHeal = roll.total + spellStats.modifier;

    if (target) {
      const isTargetPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
      if (isTargetPC) {
        const targetId = target.id === 'player' ? gameStore.activeCharacterId : target.id;
        charStore.modifyHp(targetId, totalHeal);
      } else {
        const newHp = Math.min((target.maxHp || target.hp + totalHeal), target.hp + totalHeal);
        gameStore.updateMonsterHp(target.id, newHp);
      }
    }

    commitResources();

    const logMessage = `${actorName} casts ${spellAction.name} on ${targetName}, restoring ${totalHeal} HP!`;
    gameStore.addLog(logMessage, 'success');

    return {
      success: true,
      actionName: spellAction.name,
      actorName,
      targetName,
      logMessage,
      hpChanged: totalHeal,
      hitOrSaved: 'auto'
    };
  }

  // SPELL ATTACK ROLLS
  if (spellData.spell_attack) {
    let damageDice: string | null = null;
    if (spellData.damage?.damage_at_slot_level) {
      damageDice = spellData.damage.damage_at_slot_level[String(levelToUse)] || spellData.damage.damage_at_slot_level['1'];
    } else if (spellData.damage?.damage_at_character_level) {
      damageDice = spellData.damage.damage_at_character_level['1'];
    }

    if (!damageDice) {
      const msg = `${spellAction.name} has no valid damage dice formula for Level ${levelToUse}.`;
      gameStore.addLog(msg, 'error');
      return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
    }

    const d20Roll = diceService.rollBackground('1d20', `Spell Attack (${spellAction.name})`);
    const totalToHit = d20Roll.total + spellStats.attackBonus;

    let targetAC = 10;
    if (target) {
      if (typeof target.armor_class === 'number') targetAC = target.armor_class;
      else if (Array.isArray(target.armor_class)) targetAC = target.armor_class[0]?.value || 10;
      else if (target.armor_class?.base) targetAC = target.armor_class.base;
      else if (target.stats?.dex) targetAC = 10 + Math.floor((target.stats.dex - 10) / 2);
    }

    const isHit = totalToHit >= targetAC || d20Roll.total === 20;

    commitResources();

    if (isHit) {
      const dmgRoll = diceService.rollBackground(damageDice, `Spell Damage (${spellAction.name})`);
      const damageTotal = dmgRoll.total;

      if (target) {
        const isTargetPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
        if (isTargetPC) {
          const targetId = target.id === 'player' ? gameStore.activeCharacterId : target.id;
          charStore.modifyHp(targetId, -damageTotal);
        } else {
          const currentHp = target.hp !== undefined ? target.hp : target.hit_points;
          const newHp = Math.max(0, currentHp - damageTotal);
          gameStore.updateMonsterHp(target.id, newHp);
          if (newHp <= 0) {
            gameStore.addLog(`${targetName} has been defeated!`, 'success');
            setTimeout(() => gameStore.removeMonsterFromCombat(target.id), 500);
          }
        }
      }

      const logMessage = `${actorName} casts ${spellAction.name} at ${targetName}: HIT! (${totalToHit} vs AC ${targetAC}) dealing ${damageTotal} damage.`;
      gameStore.addLog(logMessage, 'success');

      return {
        success: true,
        actionName: spellAction.name,
        actorName,
        targetName,
        logMessage,
        hpChanged: -damageTotal,
        hitOrSaved: 'hit',
        rollTotal: totalToHit
      };
    } else {
      const logMessage = `${actorName} casts ${spellAction.name} at ${targetName}: MISS! (${totalToHit} vs AC ${targetAC}).`;
      gameStore.addLog(logMessage, 'warning');

      return {
        success: true,
        actionName: spellAction.name,
        actorName,
        targetName,
        logMessage,
        hpChanged: 0,
        hitOrSaved: 'miss',
        rollTotal: totalToHit
      };
    }
  }

  // SAVING THROW SPELLS
  if (spellData.dc) {
    let damageDice: string | null = null;
    if (spellData.damage?.damage_at_slot_level) {
      damageDice = spellData.damage.damage_at_slot_level[String(levelToUse)] || spellData.damage.damage_at_slot_level['1'];
    }

    const dcType = spellData.dc.dc_type?.index || 'dex';
    let targetSaveMod = 0;
    if (target?.stats && target.stats[dcType]) {
      targetSaveMod = Math.floor((target.stats[dcType] - 10) / 2);
    }

    const saveRoll = diceService.rollBackground('1d20', `Saving Throw vs ${spellAction.name}`);
    const totalSave = saveRoll.total + targetSaveMod;
    const passedSave = totalSave >= spellStats.saveDC;

    let finalDamage = 0;
    if (damageDice) {
      const dmgRoll = diceService.rollBackground(damageDice, `Spell Damage (${spellAction.name})`);
      finalDamage = dmgRoll.total;
      if (passedSave) {
        finalDamage = spellData.dc.dc_success === 'half' ? Math.floor(finalDamage / 2) : 0;
      }

      if (finalDamage > 0 && target) {
        const isTargetPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
        if (isTargetPC) {
          const targetId = target.id === 'player' ? gameStore.activeCharacterId : target.id;
          charStore.modifyHp(targetId, -finalDamage);
        } else {
          const currentHp = target.hp !== undefined ? target.hp : target.hit_points;
          const newHp = Math.max(0, currentHp - finalDamage);
          gameStore.updateMonsterHp(target.id, newHp);
          if (newHp <= 0) {
            gameStore.addLog(`${targetName} has been defeated!`, 'success');
            setTimeout(() => gameStore.removeMonsterFromCombat(target.id), 500);
          }
        }
      }
    }

    commitResources();

    const logMessage = `${actorName} casts ${spellAction.name} on ${targetName}. ${targetName} ${passedSave ? 'SAVED' : 'FAILED SAVE'} (${totalSave} vs DC ${spellStats.saveDC}), taking ${finalDamage} damage.`;
    gameStore.addLog(logMessage, passedSave ? 'info' : 'error');

    return {
      success: true,
      actionName: spellAction.name,
      actorName,
      targetName,
      logMessage,
      hpChanged: -finalDamage,
      hitOrSaved: passedSave ? 'saved' : 'failed_save',
      rollTotal: totalSave
    };
  }

  // AUTO-HIT DAMAGE SPELLS (e.g. Magic Missile, damage without spell_attack or dc)
  if (spellData.damage && !spellData.spell_attack && !spellData.dc) {
    let damageDice: string | null = null;
    if (spellData.damage.damage_at_slot_level) {
      damageDice = spellData.damage.damage_at_slot_level[String(levelToUse)] || spellData.damage.damage_at_slot_level['1'];
    } else if (spellData.damage.damage_at_character_level) {
      damageDice = spellData.damage.damage_at_character_level['1'];
    }

    if (!damageDice) {
      const msg = `${spellAction.name} has no valid damage dice formula for Level ${levelToUse}.`;
      gameStore.addLog(msg, 'error');
      return { success: false, actionName: spellAction.name, actorName, targetName, logMessage: msg, hpChanged: 0 };
    }

    const dmgRoll = diceService.rollBackground(damageDice, `Spell Damage (${spellAction.name})`);
    const damageTotal = dmgRoll.total;

    if (target) {
      const isTargetPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
      if (isTargetPC) {
        const targetId = target.id === 'player' ? gameStore.activeCharacterId : target.id;
        charStore.modifyHp(targetId, -damageTotal);
      } else {
        const currentHp = target.hp !== undefined ? target.hp : target.hit_points;
        const newHp = Math.max(0, currentHp - damageTotal);
        gameStore.updateMonsterHp(target.id, newHp);
        if (newHp <= 0) {
          gameStore.addLog(`${targetName} has been defeated!`, 'success');
          setTimeout(() => gameStore.removeMonsterFromCombat(target.id), 500);
        }
      }
    }

    commitResources();

    const logMessage = `${actorName} casts ${spellAction.name} at ${targetName}! Strikes for ${damageTotal} damage (Auto-hit).`;
    gameStore.addLog(logMessage, 'success');

    return {
      success: true,
      actionName: spellAction.name,
      actorName,
      targetName,
      logMessage,
      hpChanged: -damageTotal,
      hitOrSaved: 'auto'
    };
  }

  // UTILITY / SELF SPELLS
  if (!spellData.damage && !spellData.heal_at_slot_level) {
    commitResources();

    const logMessage = `${actorName} casts ${spellAction.name}!`;
    gameStore.addLog(logMessage, 'info');

    return {
      success: true,
      actionName: spellAction.name,
      actorName,
      targetName,
      logMessage,
      hpChanged: 0,
      hitOrSaved: 'auto'
    };
  }

  // UNSUPPORTED SPELL MECHANICS (Explicit error logging, no resource consumption)
  const unsuppMsg = `Spell ${spellAction.name} mechanic is currently unsupported in combat resolution.`;
  gameStore.addLog(unsuppMsg, 'error');
  return {
    success: false,
    actionName: spellAction.name,
    actorName,
    targetName,
    logMessage: unsuppMsg,
    hpChanged: 0
  };
}
