const fs = require('fs');
const path = require('path');

const base = 'public/assets/atlas/world/toril/faerun';
const subRegionsDir = path.join(base, 'sub_regions');

const categories = ['forest', 'mountains', 'waters', 'wetlands', 'plains_grasslands', 'deserts_wastelands'];

function findCoords(id) {
  for (const cat of categories) {
    const catDir = path.join(base, cat);
    if (!fs.existsSync(catDir)) continue;
    
    // Check aggregate
    const aggregate = path.join(catDir, cat + '.json');
    if (fs.existsSync(aggregate)) {
      const data = JSON.parse(fs.readFileSync(aggregate, 'utf8'));
      const locs = data.locations || data || [];
      const found = locs.find(l => l.id === id || l.name?.toLowerCase().replace(/\s+/g, '_') === id);
      if (found && (found.position || found.coordinates)) return found.position || found.coordinates;
    }
    
    // Check individual
    const individual = path.join(catDir, id, id + '.json');
    if (fs.existsSync(individual)) {
      const data = JSON.parse(fs.readFileSync(individual, 'utf8'));
      if (data.position || data.coordinates) return data.position || data.coordinates;
    }
  }
  return null;
}

const subDirs = fs.readdirSync(subRegionsDir).filter(f => fs.statSync(path.join(subRegionsDir, f)).isDirectory());

subDirs.forEach(dir => {
  const jsonPath = path.join(subRegionsDir, dir, dir + '.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!data.coordinates && !data.position) {
      const coords = findCoords(data.id);
      if (coords) {
        data.coordinates = Array.isArray(coords) ? { x: coords[0], y: coords[1] } : coords;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        console.log(`Fixed coords for ${jsonPath}`);
      }
    }
  }
});
