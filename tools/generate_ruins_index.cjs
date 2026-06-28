const fs = require('fs');
const path = require('path');

const ruinsDir = 'public/assets/atlas/world/toril/faerun/ruins/';
const folders = fs.readdirSync(ruinsDir).filter(f => fs.statSync(path.join(ruinsDir, f)).isDirectory());

const ruins = [];

folders.forEach(folder => {
    const jsonPath = path.join(ruinsDir, folder, `${folder}.json`);
    if (fs.existsSync(jsonPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            ruins.push({
                id: data.id,
                name: data.name,
                type: data.type || 'ruin',
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

fs.writeFileSync(path.join(ruinsDir, 'ruins.json'), JSON.stringify(ruins, null, 2));
console.log(`Generated ruins.json with ${ruins.length} entries.`);
