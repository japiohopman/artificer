const fs = require('fs');
const path = require('path');

const baseDir = 'public/assets/atlas/world/toril/faerun';
const categories = ['poi', 'glaciers_tundras'];

categories.forEach(category => {
  const mainFilePath = path.join(baseDir, category, `${category}.json`);
  const categoryDir = path.join(baseDir, category);

  if (!fs.existsSync(mainFilePath)) {
    console.warn(`Main file not found: ${mainFilePath}`);
    return;
  }

  console.log(`Processing category: ${category}`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(mainFilePath, 'utf8'));
  } catch (e) {
    console.error(`Failed to parse ${mainFilePath}: ${e.message}`);
    return;
  }

  if (!Array.isArray(data)) {
    console.error(`Data in ${mainFilePath} is not an array`);
    return;
  }

  data.forEach(item => {
    if (!item.id) {
      console.warn(`Item missing id in ${category}: ${JSON.stringify(item).substring(0, 50)}...`);
      return;
    }

    const itemDir = path.join(categoryDir, item.id);
    if (!fs.existsSync(itemDir)) {
      fs.mkdirSync(itemDir, { recursive: true });
    }

    const itemFilePath = path.join(itemDir, `${item.id}.json`);
    fs.writeFileSync(itemFilePath, JSON.stringify(item, null, 2));
  });
  console.log(`Done processing ${category}. Total items: ${data.length}`);
});
