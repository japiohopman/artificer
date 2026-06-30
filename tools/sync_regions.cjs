const fs = require('fs');
const path = require('path');

// Mocking REGION_METADATA as we can't easily import TS here without setup
const REGION_METADATA = {
  west_faerun: { focalPoint: [7991, 6550], zoom: 4 },
  northwest_faerun: { focalPoint: [13076, 4044], zoom: 4 },
  north_faerun: { focalPoint: [13004, 8947], zoom: 4 },
  northeast_faerun: { focalPoint: [13004, 17707], zoom: 4 },
  interior_faerun: { focalPoint: [7846, 10095], zoom: 4 },
  sea_of_the_fallen_stars: { focalPoint: [9226, 13027], zoom: 4 },
  southwest_faerun: { focalPoint: [976, 6060], zoom: 4 },
  southeast_faerun: { focalPoint: [3192, 17380], zoom: 4 },
  east_faerun: { focalPoint: [7918, 18361], zoom: 4 },
  south_faerun: { focalPoint: [2211, 12810], zoom: 4 },
  shining_south: { focalPoint: [1362, 15433], zoom: 4 },
  moonshae_isles: { focalPoint: [8735, 17232], zoom: 4 },
  water: { focalPoint: [7230, 10810], zoom: 2 }
};

const regionsRoot = 'public/assets/atlas/world/toril/faerun/regions';
const regionDirs = fs.readdirSync(regionsRoot).filter(f => fs.statSync(path.join(regionsRoot, f)).isDirectory());

regionDirs.forEach(dir => {
  const jsonPath = path.join(regionsRoot, dir, dir + '.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const meta = REGION_METADATA[data.id];
    if (meta) {
      data.focal_point = meta.focalPoint;
      data.zoom = meta.zoom;
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
      console.log(`Synced ${jsonPath}`);
    }
  }
});
