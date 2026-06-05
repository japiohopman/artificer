const fs = require('fs');
const path = require('path');

const ABILITY_DIR = path.join(__dirname, '../public/assets/atlas/ability_scores/json');
const DAMAGE_DIR = path.join(__dirname, '../public/assets/atlas/damage_types/json');

if (!fs.existsSync(ABILITY_DIR)) fs.mkdirSync(ABILITY_DIR, { recursive: true });
if (!fs.existsSync(DAMAGE_DIR)) fs.mkdirSync(DAMAGE_DIR, { recursive: true });

const abilities = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
abilities.forEach(a => {
  const data = {
    index: a.substring(0, 3),
    name: a,
    full_name: a.charAt(0).toUpperCase() + a.slice(1),
    desc: [`Standard D&D ability score: ${a}`]
  };
  fs.writeFileSync(path.join(ABILITY_DIR, `${a}.json`), JSON.stringify(data, null, 2));
});

const damages = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
damages.forEach(d => {
  const data = {
    index: d,
    name: d,
    desc: [`Standard D&D damage type: ${d}`]
  };
  fs.writeFileSync(path.join(DAMAGE_DIR, `${d}.json`), JSON.stringify(data, null, 2));
});

console.log('Successfully created core data files.');
