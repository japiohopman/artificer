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
  const lowerIndex = String(index || '').toLowerCase().replace(/-/g, '_');
  const lowerName = String(name || '').toLowerCase().replace(/\s+/g, '_');

  // Exact matches or inclusions
  if (lowerIndex.includes('expertise')) return 'expertise';
  if (lowerIndex.includes('second_wind')) return 'second_wind';
  if (lowerIndex.includes('action_surge')) return 'action_surge';
  if (lowerIndex.includes('dual_personalities')) return 'dual_personalities';
  if (lowerIndex.includes('expertise')) return 'expertise';
  
  // Check subclasses
  if (lowerIndex.includes('champion')) return 'champion';
  if (lowerIndex.includes('battle_master')) return 'battle_master';
  if (lowerIndex.includes('eldritch_knight')) return 'eldritch_knight';
  if (lowerIndex.includes('psi_warrior')) return 'psi_warrior';
  if (lowerIndex.includes('arcane_trickster')) return 'arcane_trickster';
  if (lowerIndex.includes('thief')) return 'thief';
  if (lowerIndex.includes('assassin')) return 'assassin';

  // Check fighting styles
  if (lowerIndex.includes('fighting_style')) {
    if (lowerIndex.includes('archery')) return 'fighter_fighting_style_archery';
    if (lowerIndex.includes('defense')) return 'fighter_fighting_style_defense';
    if (lowerIndex.includes('dueling')) return 'fighter_fighting_style_dueling';
    if (lowerIndex.includes('great_weapon')) return 'fighter_fighting_style_great_weapon_fighting';
    if (lowerIndex.includes('protection')) return 'fighter_fighting_style_protection';
    if (lowerIndex.includes('two_weapon')) return 'fighter_fighting_style_two_weapon_fighting';
    return 'sword';
  }

  // Exact matches for index or normalized name
  return lowerIndex;
}

export function getTraitIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_');
}

export function getFeatIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_');
}

export function getMagicSchoolIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_');
}

export function getLanguageIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_');
}

export function getAlignmentIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_');
}

export function getBackgroundIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_');
}

export function getProficiencyIcon(index: string): string {
  if (!index) return 'award';
  return index.toLowerCase().replace(/-/g, '_');
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
