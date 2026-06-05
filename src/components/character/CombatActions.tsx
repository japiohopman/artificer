import React from 'react';
import { useStore } from '../../store/useStore';
import { calculateDerivedStats, getEffectiveStats } from '../../lib/statCalculations';
import { GameIcon, GameIconName } from '../../game_icons';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface CombatActionProps {
  icon: GameIconName;
  name: string;
  type: string;
  range: string;
  hit: string;
  damage: string;
  damageIcon: GameIconName;
  cost?: number;
  special?: string;
}

const CombatActionCard: React.FC<CombatActionProps> = ({ 
  icon, name, type, range, hit, damage, damageIcon, cost = 1, special 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/40 border border-dragon-red/10 rounded-sm p-2 flex flex-col gap-2 relative group hover:bg-white/60 transition-all shadow-sm"
    >
      {/* Top row: Icon and Name + Type */}
      <div className="flex items-start gap-2">
        <div className="w-10 h-10 shrink-0 bg-parchment-200 rounded-sm flex items-center justify-center border border-parchment-300">
           <GameIcon name={icon} size={24} color="#4A4A4A" className="group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-black uppercase tracking-tight text-dragon-darkRed truncate leading-none mb-1">{name}</h4>
          <div className="flex items-center gap-1.5 opacity-60">
             <span className="text-[8px] font-bold uppercase tracking-widest">{type}</span>
             <span className="w-1 h-1 bg-parchment-400 rounded-full" />
             <span className="text-[8px] font-bold uppercase tracking-widest">{range}</span>
          </div>
        </div>
        {cost > 0 && (
          <div className="flex gap-0.5">
            {Array.from({ length: cost }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-dragon-red rounded-full shadow-[0_0_5px_rgba(139,0,0,0.5)]" />
            ))}
          </div>
        )}
      </div>

      {/* Stats row: Dice and Damage */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-parchment-100/50 rounded-sm p-1 border border-parchment-200 flex flex-col items-center">
           <span className="text-[6px] font-black text-parchment-400 uppercase tracking-tighter mb-0.5">To Hit</span>
           <span className="text-[12px] font-cinzel font-black text-parchment-900 leading-none">{hit}</span>
        </div>
        <div className="bg-parchment-100/50 rounded-sm p-1 border border-parchment-200 flex flex-col items-center relative overflow-hidden">
           <div className="absolute -right-2 -top-2 opacity-10">
              <GameIcon name={damageIcon} size={20} color="#8B0000" />
           </div>
           <span className="text-[6px] font-black text-parchment-400 uppercase tracking-tighter mb-0.5">Damage</span>
           <div className="flex items-center gap-1 leading-none">
              <span className="text-[12px] font-cinzel font-black text-dragon-red">{damage}</span>
              <GameIcon name={damageIcon} size={10} color="#8B0000" className="opacity-60" />
           </div>
        </div>
      </div>

      {special && (
        <div className="mt-1 pt-1 border-t border-parchment-200/50">
           <p className="text-[8px] italic text-parchment-500 leading-tight">
             <span className="font-bold text-dragon-red/60 uppercase mr-1 not-italic tracking-tighter">Special:</span>
             {special}
           </p>
        </div>
      )}
    </motion.div>
  );
};

export const CombatActions: React.FC = () => {
  const { characters, activeCharacterId } = useStore();
  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];
  
  if (!activeCharacter) return null;

  const effectiveStats = getEffectiveStats(activeCharacter);
  const derived = calculateDerivedStats(activeCharacter);
  const strMod = Math.floor(((effectiveStats?.str || 10) - 10) / 2);
  const dexMod = Math.floor(((effectiveStats?.dex || 10) - 10) / 2);

  const getDamageIcon = (type: string): GameIconName => {
    const t = type.toLowerCase();
    if (t.includes('pierce')) return 'piercing'; 
    if (t.includes('slash')) return 'slashing'; 
    if (t.includes('bludgeon')) return 'bludgeoning';
    if (t.includes('fire')) return 'fire';
    return 'sparkles';
  };

  const getWeaponCategoryIcon = (w: any): GameIconName => {
    if (w.weapon_range === 'Ranged' || w.index?.includes('bow') || w.index?.includes('crossbow')) return 'ranged_attack';
    return 'melee';
  };

  const renderActions = () => {
    const weapons = Object.entries(activeCharacter.inventory || {}).filter(([slot, item]: [string, any]) => 
      item && (item.equipment_category?.index === 'weapon' || item._type === 'equipment' && (item.index?.includes('sword') || item.index?.includes('dagger') || item.index?.includes('bow')))
    );

    const actions = weapons.map(([slot, w]: [string, any]) => {
      const styles = (activeCharacter.choices?.['fighting-style'] || []).map((s: string) => s.toLowerCase());
      const hasArchery = styles.some(s => s === 'archery' || s.includes('archery'));
      const hasDueling = styles.some(s => s === 'dueling' || s.includes('dueling'));
      
      const isRanged = w.weapon_range === 'Ranged' || w.index?.includes('bow') || w.index?.includes('crossbow');
      const isFinesse = w.properties?.some((p: any) => p.index === 'finesse' || p.name === 'Finesse');
      const abilityMod = (isRanged || (isFinesse && dexMod > strMod)) ? dexMod : strMod;
      
      let bonus = derived.proficiencyBonus + abilityMod + (w.attack_bonus || 0) + (w.feature_specific?.passive_modifiers?.attack_bonus || 0);
      if (isRanged && hasArchery) bonus += 2;
      
      let dmgDice = w.damage?.damage_dice || "1d4";
      let dmgType = w.damage?.damage_type?.name || "Piercing";
      if (w.index?.includes('sword')) { dmgDice = "1d8"; dmgType = "Slashing"; }
      if (w.index?.includes('dagger')) { dmgDice = "1d4"; dmgType = "Piercing"; }
      if (w.index?.includes('bow')) { dmgDice = "1d8"; dmgType = "Piercing"; }
      
      let dmgBonus = abilityMod + (w.damage_bonus || 0) + (w.feature_specific?.passive_modifiers?.damage_bonus || 0);
      
      // Dueling: +2 to damage if wielding a melee weapon in one hand and no other weapon
      const hasShield = !!activeCharacter.inventory?.['off-hand'];
      const hasOffHandWeapon = activeCharacter.inventory?.['off-hand']?._type === 'equipment' && activeCharacter.inventory?.['off-hand']?.index?.includes('weapon');
      if (!isRanged && hasDueling && !hasOffHandWeapon) {
        dmgBonus += 2;
      }

      const fullDamage = `${dmgDice}${dmgBonus >= 0 ? '+' : ''}${dmgBonus}`;

      return (
        <CombatActionCard 
          key={slot}
          name={w.name}
          icon={getWeaponCategoryIcon(w)}
          type={isRanged ? "Ranged Weapon" : "Melee Weapon"}
          range={isRanged ? (w.range?.long ? `${w.range.normal}/${w.range.long} ft` : `${w.range?.normal || 80} ft`) : "5 ft"}
          hit={bonus >= 0 ? `+${bonus}` : bonus.toString()}
          damage={fullDamage}
          damageIcon={getDamageIcon(dmgType)}
          cost={1}
        />
      );
    });

    // Unarmed Strike
    actions.push(
      <CombatActionCard 
        key="unarmed"
        name="Unarmed Strike"
        icon="unarmed_strike"
        type="Melee Attack"
        range="5 ft"
        hit={(derived.proficiencyBonus + strMod) >= 0 ? `+${derived.proficiencyBonus + strMod}` : (derived.proficiencyBonus + strMod).toString()}
        damage={`1${strMod >= 0 ? '+' : ''}${strMod}`}
        damageIcon="bludgeoning"
        cost={1}
      />
    );

    // Special Actions
    const hasSneakAttack = activeCharacter.features?.some(f => f.index === 'sneak-attack');
    const isRogue = activeCharacter.class?.toLowerCase().includes('rogue') || activeCharacter.class?.toLowerCase().includes('thief');
    
    if (hasSneakAttack || (isRogue && activeCharacter.level >= 1)) {
      const sneakDmg = Math.ceil(activeCharacter.level / 2);
      actions.push(
        <CombatActionCard 
          key="sneak-attack"
          name="Sneak Attack"
          icon="sneak_attack"
          type="Ability"
          range="Weapon Rng"
          hit="N/A"
          damage={`+${sneakDmg}d6`}
          damageIcon="piercing"
          cost={0}
          special="Once per turn, deal extra damage to a creature you hit with an attack if you have advantage or an ally is nearby."
        />
      );
    }

    // Cunning Action (Level 2 Rogue)
    if (isRogue && activeCharacter.level >= 2) {
      actions.push(
        <CombatActionCard 
          key="cunning-action"
          name="Cunning Action"
          icon="cunning_action"
          type="Bonus Action"
          range="Self"
          hit="N/A"
          damage="N/A"
          damageIcon="sparkles"
          cost={1}
          special="You can take a bonus action on each of your turns in combat to take the Dash, Disengage, or Hide action."
        />
      );
    }

    // Uncanny Dodge (Level 5 Rogue)
    const hasUncannyDodge = activeCharacter.features?.some(f => f.index === 'uncanny-dodge' || f.index === 'uncanny_dodge');
    if (hasUncannyDodge || (isRogue && activeCharacter.level >= 5)) {
      actions.push(
        <CombatActionCard 
          key="uncanny-dodge"
          name="Uncanny Dodge"
          icon="uncanny_dodge"
          type="Reaction"
          range="Self"
          hit="N/A"
          damage="Halve Dmg"
          damageIcon="shield"
          cost={0}
          special="When an attacker you can see hits you with an attack, you can use your reaction to halve the attack's damage against you."
        />
      );
    }

    // Class specific specials
    if (activeCharacter.class?.toLowerCase().includes('battle smith')) {
        actions.push(
            <CombatActionCard 
              key="defender-command"
              name="Command Defender"
              icon="gear"
              type="Bonus Action"
              range="60 ft"
              hit="Spell"
              damage="Variable"
              damageIcon="force"
              cost={1}
              special="Command your Steel Defender to take an action or protect an ally."
            />
        );
    }

    // Fighter Features
    if (activeCharacter.class?.toLowerCase() === 'fighter') {
      // Second Wind
      if (activeCharacter.level >= 1) {
        actions.push(
          <CombatActionCard 
            key="second-wind"
            name="Second Wind"
            icon="second_wind"
            type="Bonus Action"
            range="Self"
            hit="N/A"
            damage={`1d10 + ${activeCharacter.level}`}
            damageIcon="second_wind"
            cost={1}
            special="Regain hit points equal to 1d10 + your fighter level. Once per rest."
          />
        );
      }

      // Action Surge (Level 2)
      if (activeCharacter.level >= 2) {
        actions.push(
          <CombatActionCard 
            key="action-surge"
            name="Action Surge"
            icon="action_surge"
            type="Action"
            range="Self"
            hit="N/A"
            damage="+1 Action"
            damageIcon="action_surge"
            cost={0}
            special="On your turn, you can take one additional action on top of your regular action. Once per rest."
          />
        );
      }

      // Dual Personalities (Specific feature check)
      const hasDualPersonalities = activeCharacter.features?.some(f => f.index === 'dual-personalities' || f.index === 'dual_personalities');
      if (hasDualPersonalities) {
        actions.push(
          <CombatActionCard 
            key="dual-personalities"
            name="Dual Personalities"
            icon="dual_personalities"
            type="Passive"
            range="Self"
            hit="N/A"
            damage="N/A"
            damageIcon="dual_personalities"
            cost={0}
            special="Your dual nature grants you unique advantages in and out of combat."
          />
        );
      }

      // Fighting Styles
      const styles = (activeCharacter.choices?.['fighting-style'] || []).map((s: string) => s.toLowerCase());
      
      if (styles.some(s => s === 'archery' || s.includes('archery'))) {
        actions.push(
          <CombatActionCard 
            key="archery"
            name="Archery Fighting Style"
            icon="fighter_fighting_style_archery"
            type="Passive"
            range="Ranged"
            hit="+2"
            damage="N/A"
            damageIcon="piercing"
            cost={0}
            special="You gain a +2 bonus to attack rolls you make with ranged weapons. (Already included in Attack bonus)"
          />
        );
      }
      
      if (styles.some(s => s === 'defense' || s.includes('defense'))) {
        actions.push(
          <CombatActionCard 
            key="defense"
            name="Defense Fighting Style"
            icon="fighter_fighting_style_defense"
            type="Passive"
            range="Self"
            hit="N/A"
            damage="+1 AC"
            damageIcon="shield"
            cost={0}
            special="While you are wearing armor, you gain a +1 bonus to AC. (Already included in AC)"
          />
        );
      }

      if (styles.some(s => s === 'great weapon fighting' || s.includes('great_weapon') || s.includes('great-weapon'))) {
        actions.push(
          <CombatActionCard 
            key="gwf"
            name="Great Weapon Fighting"
            icon="fighter_fighting_style_great_weapon_fighting"
            type="Passive"
            range="Self"
            hit="N/A"
            damage="Reroll 1-2"
            damageIcon="slashing"
            cost={0}
            special="When you roll a 1 or 2 on a damage die for an attack you make with a two-handed melee weapon, you can reroll the die."
          />
        );
      }
      if (styles.some(s => s === 'dueling' || s.includes('dueling'))) {
        actions.push(
          <CombatActionCard 
            key="dueling"
            name="Dueling Style"
            icon="fighter_fighting_style_dueling"
            type="Passive"
            range="Self"
            hit="N/A"
            damage="+2"
            damageIcon="piercing"
            cost={0}
            special="When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon."
          />
        );
      }
      if (styles.some(s => s === 'protection' || s.includes('protection'))) {
        actions.push(
          <CombatActionCard 
            key="protection"
            name="Protection"
            icon="fighter_fighting_style_protection"
            type="Reaction"
            range="5 ft"
            hit="Disadv"
            damage="N/A"
            damageIcon="shield"
            cost={0}
            special="When a creature you can see attacks a target other than you within 5 ft, you can impose disadvantage on the attack roll."
          />
        );
      }
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {/* Action Economy Tray */}
      <div className="bg-parchment-900/5 p-4 rounded-xl border border-dragon-red/10 relative overflow-hidden shadow-inner">
        <div className="grid grid-cols-3 gap-6">
           <div className="flex flex-col items-center">
              <div className="flex gap-1.5 mb-2">
                 {Array.from({ length: activeCharacter.actionEconomy?.actions.max || 1 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={false}
                      animate={{ 
                        scale: i < (activeCharacter.actionEconomy?.actions.current || 0) ? 1 : 0.9,
                        opacity: i < (activeCharacter.actionEconomy?.actions.current || 0) ? 1 : 0.3
                      }}
                      className={cn(
                        "w-4 h-4 rounded-sm rotate-45 border transition-all duration-300", 
                        i < (activeCharacter.actionEconomy?.actions.current || 0) 
                          ? "bg-dragon-red border-dragon-red shadow-[0_0_12px_rgba(139,0,0,0.5)]" 
                          : "bg-transparent border-dragon-red/30"
                      )} 
                    />
                 ))}
              </div>
              <span className="text-[8px] font-black text-dragon-red uppercase tracking-[0.22em]">Actions</span>
           </div>

           <div className="flex flex-col items-center">
              <div className="flex gap-1.5 mb-2">
                 {Array.from({ length: activeCharacter.actionEconomy?.bonusActions.max || 1 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={false}
                      animate={{ 
                        scale: i < (activeCharacter.actionEconomy?.bonusActions.current || 0) ? 1 : 0.9,
                        opacity: i < (activeCharacter.actionEconomy?.bonusActions.current || 0) ? 1 : 0.3
                      }}
                      className={cn(
                        "w-3.5 h-3.5 rounded-full border transition-all duration-300", 
                        i < (activeCharacter.actionEconomy?.bonusActions.current || 0) 
                          ? "bg-dragon-gold border-dragon-gold shadow-[0_0_12px_rgba(212,175,55,0.5)]" 
                          : "bg-transparent border-dragon-gold/30"
                      )} 
                    />
                 ))}
              </div>
              <span className="text-[8px] font-black text-dragon-gold uppercase tracking-[0.22em]">Bonus</span>
           </div>

           <div className="flex flex-col items-center">
              <div className="flex gap-1.5 mb-2">
                 {Array.from({ length: activeCharacter.actionEconomy?.reactions.max || 1 }).map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={false}
                      animate={{ 
                        scale: i < (activeCharacter.actionEconomy?.reactions.current || 0) ? 1 : 0.9,
                        opacity: i < (activeCharacter.actionEconomy?.reactions.current || 0) ? 1 : 0.3
                      }}
                      className={cn(
                        "w-3.5 h-3.5 rounded-sm border transition-all duration-300", 
                        i < (activeCharacter.actionEconomy?.reactions.current || 0) 
                          ? "bg-dragon-darkRed border-dragon-darkRed shadow-[0_0_12px_rgba(100,0,0,0.5)]" 
                          : "bg-transparent border-dragon-darkRed/30"
                      )} 
                    />
                 ))}
              </div>
              <span className="text-[8px] font-black text-dragon-red/60 uppercase tracking-[0.22em]">Reaction</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
         {renderActions()}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-parchment-300/50 mt-4">
         <div className="flex items-center gap-2 opacity-40">
           <GameIcon name="info" size={10} color="#4A4A4A" />
           <p className="text-[7px] font-bold uppercase tracking-widest text-parchment-600 italic">
             Most actions consume 1 Action Point. Check special rules for exceptions.
           </p>
         </div>
      </div>
    </div>
  );
};
