const fs = require('fs');
const path = require('path');
const { Validator } = require('jsonschema');

const schemaPath = 'public/assets/atlas/schemas/city.schema.json';
const citiesDir = 'public/assets/atlas/world/toril/faerun/cities/';

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const v = new Validator();

const cityFiles = [];

function getFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'sublocations') {
                getFiles(fullPath);
            }
        } else if (file.endsWith('.json') && file !== 'cities.json' && !file.includes('schema.json')) {
            // Check if it's the main city file (usually named [cityname].json)
            const parentDir = path.basename(path.dirname(fullPath));
            if (file === parentDir + '.json') {
                cityFiles.push(fullPath);
            }
        }
    }
}

getFiles(citiesDir);

console.log(`Found ${cityFiles.length} main city files.`);

let validCount = 0;
let invalidCount = 0;

cityFiles.forEach(file => {
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const res = v.validate(data, schema);
        if (!res.valid) {
            console.log(`\nFile: ${file}`);
            res.errors.forEach(err => {
                console.log(`  - ${err.stack}`);
            });
            invalidCount++;
        } else {
            validCount++;
        }
    } catch (e) {
        console.log(`Error reading ${file}: ${e.message}`);
    }
});

console.log(`\nSummary: ${validCount} valid, ${invalidCount} invalid.`);
