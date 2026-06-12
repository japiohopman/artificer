# 🗺️ Leaflet Map Integration

The **Atlas Map** uses Leaflet to provide a spatial representation of Toril and the Sword Coast.

## 🧩 Map Layers

### 1. Base Layer
- High-resolution scans of Sword Coast maps.
- Tiled for performance using standard Leaflet patterns.

### 2. Location Layer (Markers)
- Markers are coupled to Atlas JSON files via `id` or `index`.
- **Dynamic Coupling**:
    - `city.json` -> City Marker.
    - `poi.json` -> Point of Interest Marker.
- Markers change state based on `partyLocation` (e.g., highlighting the current settlement).

### 3. Party Layer
- A unique marker representing the group's current position.
- Animates along `road.json` paths during travel.

### 4. Fog of War
- Persisted in the `PartyState`.
- Overlays that hide unvisited coordinates on the `atlas_map.tsx`.

## 🛠️ Data Coupling
- Map data is fetched via `atlasService.ts`.
- Coordinates in JSON (e.g., `[x, y]`) are mapped to Leaflet's `LatLng` coordinate system using the image dimensions as a reference (see `Toril_image_locations.md`).
