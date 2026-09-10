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
  const level = spell.level !== undefined ? Number(spell.level) : 1;
  const castingTime = (spell.casting_time || '').toLowerCase();

  let actionType: 'actions' | 'bonusActions' | 'reactions' = 'actions';
  if (castingTime.includes('bonus')) {
    actionType = 'bonusActions';
  } else if (castingTime.includes('reaction')) {
    actionType = 'reactions';
  }

  // Determine if this spell requires an attack roll
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
      spell_attack: isAttackRoll
    }
  };
}

/**
 * Executes a spell action using canonical spell mechanics.
 * Shared between runtime combat and devkit CombatTester.
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
  const levelToUse = castLevel || spellData.level || 1;
  const actorName = actor.name || 'Caster';
  const targetName = target.name || 'Target';

  // Determine spellcasting ability / modifier / attack bonus / DC
  let spellModifier = 3;
  let spellAttackBonus = 5;
  let spellSaveDC = 13;

  if (actor.stats) {
    const intMod = Math.floor(((actor.stats.int || 10) - 10) / 2);
    const wisMod = Math.floor(((actor.stats.wis || 10) - 10) / 2);
    const chaMod = Math.floor(((actor.stats.cha || 10) - 10) / 2);
    spellModifier = Math.max(intMod, wisMod, chaMod, 1);
    const profBonus = 2; // Default level 1-4 prof bonus
    spellAttackBonus = spellModifier + profBonus;
    spellSaveDC = 8 + profBonus + spellModifier;
  }

  // 1. HEALING SPELLS (e.g. Cure Wounds)
  if (spellData.heal_at_slot_level) {
    const healFormula = spellData.heal_at_slot_level[String(levelToUse)] || spellData.heal_at_slot_level['1'] || '1d8 + MOD';
    const dicePart = healFormula.replace('+ MOD', '').trim();
    const roll = diceService.rollBackground(dicePart, `Healing (${spellAction.name})`);
    const totalHeal = roll.total + spellModifier;

    // Apply healing to target
    const isPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
    if (isPC) {
      const targetId = target.id === 'player' ? gameStore.activeCharacterId : target.id;
      charStore.modifyHp(targetId, totalHeal);
    } else {
      const newHp = Math.min((target.maxHp || target.hp + totalHeal), target.hp + totalHeal);
      gameStore.updateMonsterHp(target.id, newHp);
    }

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

  // 2. SPELL ATTACK ROLLS (e.g. Guiding Bolt, Witch Bolt, Fire Bolt)
  if (spellData.spell_attack) {
    const d20Roll = diceService.rollBackground('1d20', `Spell Attack (${spellAction.name})`);
    const totalToHit = d20Roll.total + spellAttackBonus;

    // Resolve Target AC
    let targetAC = 10;
    if (target.armor_class !== undefined) {
      if (typeof target.armor_class === 'number') targetAC = target.armor_class;
      else if (Array.isArray(target.armor_class)) targetAC = target.armor_class[0]?.value || 10;
      else if (target.armor_class?.base) targetAC = target.armor_class.base;
    } else if (target.stats?.dex) {
      targetAC = 10 + Math.floor((target.stats.dex - 10) / 2);
    }

    const isHit = totalToHit >= targetAC || d20Roll.total === 20;

    if (isHit) {
      let damageDice = '1d10';
      if (spellData.damage?.damage_at_slot_level) {
        damageDice = spellData.damage.damage_at_slot_level[String(levelToUse)] || spellData.damage.damage_at_slot_level['1'] || '1d10';
      } else if (spellData.damage?.damage_at_character_level) {
        damageDice = spellData.damage.damage_at_character_level['1'] || '1d10';
      }

      const dmgRoll = diceService.rollBackground(damageDice, `Spell Damage (${spellAction.name})`);
      const damageTotal = dmgRoll.total;

      // Apply damage to target
      const isPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
      if (isPC) {
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

  // 3. SAVING THROW SPELLS (e.g. Burning Hands)
  if (spellData.dc) {
    const dcType = spellData.dc.dc_type?.index || 'dex';
    let targetSaveMod = 0;
    if (target.stats && target.stats[dcType]) {
      targetSaveMod = Math.floor((target.stats[dcType] - 10) / 2);
    }

    const saveRoll = diceService.rollBackground('1d20', `Saving Throw vs ${spellAction.name}`);
    const totalSave = saveRoll.total + targetSaveMod;
    const passedSave = totalSave >= spellSaveDC;

    let damageDice = '3d6';
    if (spellData.damage?.damage_at_slot_level) {
      damageDice = spellData.damage.damage_at_slot_level[String(levelToUse)] || spellData.damage.damage_at_slot_level['1'] || '3d6';
    }

    const dmgRoll = diceService.rollBackground(damageDice, `Spell Damage (${spellAction.name})`);
    let finalDamage = dmgRoll.total;
    if (passedSave) {
      finalDamage = spellData.dc.dc_success === 'half' ? Math.floor(finalDamage / 2) : 0;
    }

    if (finalDamage > 0) {
      const isPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
      if (isPC) {
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

    const logMessage = `${actorName} casts ${spellAction.name} on ${targetName}. ${targetName} ${passedSave ? 'SAVED' : 'FAILED SAVE'} (${totalSave} vs DC ${spellSaveDC}), taking ${finalDamage} damage.`;
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

  // 4. AUTO-HIT DAMAGE SPELLS (e.g. Magic Missile)
  if (spellAction.id === 'magic_missile' || spellAction.name.toLowerCase().includes('magic missile')) {
    // Magic Missile 1st level = 3 darts, 1d4+1 each
    const numDarts = 3 + Math.max(0, levelToUse - 1);
    let totalDmg = 0;
    for (let i = 0; i < numDarts; i++) {
      const dartRoll = diceService.rollBackground('1d4+1', `Magic Missile Dart ${i + 1}`);
      totalDmg += dartRoll.total;
    }

    const isPC = charStore.characters.some(c => c.id === target.id) || target.id === 'player';
    if (isPC) {
      const targetId = target.id === 'player' ? gameStore.activeCharacterId : target.id;
      charStore.modifyHp(targetId, -totalDmg);
    } else {
      const currentHp = target.hp !== undefined ? target.hp : target.hit_points;
      const newHp = Math.max(0, currentHp - totalDmg);
      gameStore.updateMonsterHp(target.id, newHp);
      if (newHp <= 0) {
        gameStore.addLog(`${targetName} has been defeated!`, 'success');
        setTimeout(() => gameStore.removeMonsterFromCombat(target.id), 500);
      }
    }

    const logMessage = `${actorName} casts Magic Missile at ${targetName}! ${numDarts} darts strike for ${totalDmg} force damage (Auto-hit).`;
    gameStore.addLog(logMessage, 'success');

    return {
      success: true,
      actionName: spellAction.name,
      actorName,
      targetName,
      logMessage,
      hpChanged: -totalDmg,
      hitOrSaved: 'auto'
    };
  }

  // 5. UTILITY / SELF / REACTION SPELLS (e.g. Shield)
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
