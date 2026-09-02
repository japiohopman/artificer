const fs = require('fs');
const path = require('path');

const CLASS_14_DIR = path.join(__dirname, '../public/assets/atlas/class/json/14');
const CLASS_24_DIR = path.join(__dirname, '../public/assets/atlas/class/json/24');

if (!fs.existsSync(CLASS_24_DIR)) {
  fs.mkdirSync(CLASS_24_DIR, { recursive: true });
}

const weaponMasteryMap = {
  fighter: { count: 3, description: "You can master 3 martial or simple weapons of your choice." },
  rogue: { count: 2, description: "You can master 2 weapons of your choice from your class weapon proficiencies." },
  barbarian: { count: 2, description: "You can master 2 martial or simple weapons of your choice." },
  paladin: { count: 2, description: "You can master 2 martial or simple weapons of your choice." },
  ranger: { count: 2, description: "You can master 2 martial or simple weapons of your choice." }
};

const allClasses = [
  'barbarian', 'bard', 'cleric', 'druid', 'fighter',
  'monk', 'paladin', 'ranger', 'rogue', 'sorcerer',
  'warlock', 'wizard'
];

allClasses.forEach(className => {
  const file14Path = path.join(CLASS_14_DIR, `${className}.json`);
  let baseData = {};
  if (fs.existsSync(file14Path)) {
    baseData = JSON.parse(fs.readFileSync(file14Path, 'utf8'));
  }

  const class24Obj = {
    index: className,
    name: className.charAt(0).toUpperCase() + className.slice(1),
    rulesetContext: "2024",
    hit_die: baseData.hit_die || 8,
    ...(weaponMasteryMap[className] ? { weapon_mastery: weaponMasteryMap[className] } : {}),
    proficiency_choices: baseData.proficiency_choices || [],
    proficiencies: baseData.proficiencies || [],
    saving_throws: baseData.saving_throws || [],
    starting_equipment: baseData.starting_equipment || [],
    starting_equipment_options: baseData.starting_equipment_options || [],
    ...(baseData.spellcasting ? { spellcasting: baseData.spellcasting } : {}),
    class_levels: `/assets/atlas/class/levels/24/${className}.json`,
    subclasses: baseData.subclasses || [],
    url: `/assets/atlas/class/json/24/${className}.json`,
    image: `/assets/ui/official/classes/${className}.webp`
  };

  const file24Path = path.join(CLASS_24_DIR, `${className}.json`);
  fs.writeFileSync(file24Path, JSON.stringify(class24Obj, null, 2));
  console.log(`Wrote 2024 class definition: ${file24Path}`);
});
