const fs = require('fs');
const path = require('path');

const oasesFilePath = 'public/assets/atlas/world/toril/faerun/oases/oases.json';
const oasesDir = 'public/assets/atlas/world/toril/faerun/oases/';

const oasesData = JSON.parse(fs.readFileSync(oasesFilePath, 'utf8'));

oasesData.forEach(oasis => {
  const oasisId = oasis.id;
  const oasisSubDir = path.join(oasesDir, oasisId);

  if (!fs.existsSync(oasisSubDir)) {
    fs.mkdirSync(oasisSubDir, { recursive: true });
  }

  const individualJsonPath = path.join(oasisSubDir, `${oasisId}.json`);
  // Ensure trailing newline for consistency
  fs.writeFileSync(individualJsonPath, JSON.stringify(oasis, null, 2) + '\n');
  console.log(`Created: ${individualJsonPath}`);
});
