const path = { join: (...args) => args.join('/') }; // Mock for testing

function normalizePath(val) {
  if (typeof val !== 'string') return val;
  
  let newVal = val
    .replace(/public\/assets\/atlas\//g, '/assets/atlas/')
    .replace(/^assets\/atlas\//, '/assets/atlas/');

  if ((newVal.includes('assets/atlas/') || newVal.includes('assets/images/')) && !newVal.startsWith('/')) {
    newVal = '/' + newVal;
  }

  newVal = newVal
    .replace(/\/assets\/atlas\/ability_scores\/(?!json\/)/g, '/assets/atlas/ability_scores/json/');

  newVal = newVal
    .replace(/\/ability_scores\/json\/strength\.json/g, '/ability_scores/json/str.json')
    .replace(/\/ability_scores\/json\/dexterity\.json/g, '/ability_scores/json/dex.json')
    .replace(/\/ability_scores\/json\/constitution\.json/g, '/ability_scores/json/con.json')
    .replace(/\/ability_scores\/json\/intelligence\.json/g, '/ability_scores/json/int.json')
    .replace(/\/ability_scores\/json\/wisdom\.json/g, '/ability_scores/json/wis.json')
    .replace(/\/ability_scores\/json\/charisma\.json/g, '/ability_scores/json/cha.json');

  return newVal;
}

console.log('Test 1:', normalizePath('/assets/atlas/ability_scores/json/strength.json'));
console.log('Test 2:', normalizePath('/assets/atlas/ability_scores/strength.json'));
