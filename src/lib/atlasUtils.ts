export interface FeatureOption {
  index: string;
  name: string;
  desc?: string;
}

export function extractOptionsFromFeature(feat: any): FeatureOption[] {
  if (!feat) return [];

  // Structure 1: LevelUpOverlay style 'choice'
  if (feat.choice) {
    const choice = feat.choice;
    if (choice.from?.options) {
      return choice.from.options.map((opt: any) => ({
        index: opt.index || opt.item?.index || opt.name,
        name: opt.name || opt.item?.name || opt.index,
        desc: opt.desc || opt.item?.desc
      }));
    }
  }

  // Structure 2: User provided structure 'feature_specific.subfeature_options' or 'expertise_options'
  const subOptions = feat.feature_specific?.subfeature_options || feat.feature_specific?.expertise_options;
  if (subOptions) {
    const collected: FeatureOption[] = [];
    
    const processSet = (set: any) => {
      if (!set) return;
      
      // Handle options array
      if (set.options) {
        set.options.forEach((opt: any) => {
          if (opt.option_type === 'reference' && opt.item) {
            collected.push({
              index: opt.item.index || opt.item.name,
              name: opt.item.name || opt.item.index,
              desc: opt.item.desc
            });
          } else if (opt.option_type === 'choice' && opt.choice) {
            processSet(opt.choice.from);
          } else if (opt.option_type === 'multiple' && opt.items) {
            opt.items.forEach((item: any) => {
              if (item.option_type === 'reference' && item.item) {
                collected.push({
                  index: item.item.index || item.item.name,
                  name: item.item.name || item.item.index,
                  desc: item.item.desc
                });
              } else if (item.option_type === 'choice' && item.choice) {
                processSet(item.choice.from);
              }
            });
          } else if (opt.index || opt.name) {
             // Fallback for flatter structures
             collected.push({
               index: opt.index || opt.name,
               name: opt.name || opt.index,
               desc: opt.desc
             });
          }
        });
      }
      
      // Handle direct proficiency gains if from is missing but structure exists
      if (set.option_set_type === 'options_array') {
        // Already handled by checking set.options above
      }
    };

    processSet(subOptions.from || subOptions);
    
    if (collected.length > 0) {
      // Return unique by index
      return Array.from(new Map(collected.map(item => [item.index, item])).values());
    }
  }

  return [];
}

export function getChoiceLimit(feat: any): number {
  if (!feat) return 0;
  
  const standardLimit = feat.choice?.choose || feat.feature_specific?.subfeature_options?.choose || 0;
  if (standardLimit > 0) return standardLimit;

  // Fallback for expertise features if choice data is missing
  const lowerIndex = feat.index?.toLowerCase() || '';
  if (lowerIndex.includes('expertise')) return 2;
  
  return 0;
}

export function getFeatureIcon(index: string, name: string): string {
  let lowerIndex = String(index || '').toLowerCase().replace(/-/g, '_');
  const lowerName = String(name || '').toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  
  // Strip common prefixes to get to the core identity
  lowerIndex = lowerIndex.replace(/^feature_/, '').replace(/^subclass_/, '');

  // Basic Normalization for Features
  if (lowerIndex.includes('expertise') || lowerName.includes('expertise')) return 'expertise';
  if (lowerIndex.includes('second_wind') || lowerName.includes('second_wind')) return 'second_wind';
  if (lowerIndex.includes('action_surge') || lowerName.includes('action_surge')) return 'action_surge';
  if (lowerIndex.includes('dual_personalities')) return 'identity';
  if (lowerIndex.includes('sneak_attack') || lowerName.includes('sneak_attack')) return 'sneak_attack';
  if (lowerIndex.includes('unarmored_defense')) return 'unarmored_defense';
  if (lowerIndex.includes('cunning_action')) return 'cunning_action';
  
  // Fighting Styles - map to feature icons
  if (lowerIndex.includes('fighting_style') || lowerName.includes('fighting_style')) {
    if (lowerIndex.includes('archery') || lowerName.includes('archery')) return 'fighter_fighting_style_archery';
    if (lowerIndex.includes('defense') || lowerName.includes('defense')) return 'fighting_style_defense';
    if (lowerIndex.includes('dueling') || lowerName.includes('dueling')) return 'fighting_style_dueling';
    if (lowerIndex.includes('great_weapon') || lowerName.includes('great_weapon')) return 'fighting_style_great_weapon_fighting';
    if (lowerIndex.includes('protection') || lowerName.includes('protection')) return 'fighting_style_protection';
    if (lowerIndex.includes('two_weapon') || lowerName.includes('two_weapon')) return 'fighter_fighting_style_two_weapon_fighting';
    return 'fighter_fighting_style';
  }

  // Check if it's a subclass-related feature
  if (lowerIndex.includes('thief') || lowerName.includes('thief')) return 'thief';
  if (lowerIndex.includes('assassin') || lowerName.includes('assassin')) return 'assassin';
  if (lowerIndex.includes('arcane_trickster') || lowerName.includes('arcane_trickster')) return 'arcane_trickster';
  if (lowerIndex.includes('life_domain') || lowerName.includes('life_domain') || lowerName === 'life' || lowerIndex === 'life') return 'life';
  if (lowerIndex.includes('open_hand') || lowerName.includes('open_hand')) return 'open_hand';
  if (lowerIndex.includes('battle_master') || lowerName.includes('battle_master')) return 'battle_master';
  if (lowerIndex.includes('eldritch_knight') || lowerName.includes('eldritch_knight')) return 'eldritch_knight';

  // Exact matches for index or normalized name
  return lowerIndex;
}

export function getTraitIcon(index: string): string {
  if (!index) return 'award';
  const lower = index.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
  
  // Common mappings for traits if they don't match index exactly
  if (lower.includes('darkvision')) return 'darkvision';
  if (lower.includes('resistance')) return 'damage_resistance';
  if (lower.includes('luck')) return 'lucky';
  if (lower.includes('brave')) return 'brave';
  if (lower.includes('fey_ancestry')) return 'fey_ancestry';
  
  return lower;
}

export function getFeatIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

export function getMagicSchoolIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

export function getLanguageIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

export function getAlignmentIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

export function getBackgroundIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

export function getProficiencyIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

export function getAttackIcon(name: string): string {
  if (!name) return 'sword';
  const n = name.toLowerCase();
  if (n.includes('bow')) return 'bow';
  if (n.includes('dagger')) return 'dagger';
  if (n.includes('staff')) return 'staff';
  if (n.includes('mace')) return 'mace';
  if (n.includes('axe')) return 'axe';
  if (n.includes('hammer')) return 'hammer';
  return 'sword';
}
