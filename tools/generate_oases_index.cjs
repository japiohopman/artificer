const fs = require('fs');
const path = require('path');

const oasesDir = 'public/assets/atlas/world/toril/faerun/oases/';
const folders = fs.readdirSync(oasesDir).filter(f => fs.statSync(path.join(oasesDir, f)).isDirectory());

const oases = [];

folders.forEach(folder => {
    const jsonPath = path.join(oasesDir, folder, `${folder}.json`);
    if (fs.existsSync(jsonPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            oases.push({
                id: data.id,
                name: data.name,
                type: data.type || 'oasis',
                coordinates: data.coordinates,
                position: data.position,
                popup: {
                    title: data.name,
                    description: data.description,
                    image: data.image
                }
            });
        } catch (e) {}
    }
});

fs.writeFileSync(path.join(oasesDir, 'oases.json'), JSON.stringify(oases, null, 2));
console.log(`Generated oases.json with ${oases.length} entries.`);
