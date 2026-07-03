# 🗺️ Leaflet Map Integration

The **Atlas Map** uses Leaflet to provide a spatial representation of Toril and the Sword Coast.

## 🧩 Map Layers

### 1. Base Layer (Pyramid Tiles)
- **Source**: Tiled imagery located in `public/tiles/faerun/`.
- **Structure**: Standard Z/X/Y directory structure.
- **Zoom Range**: Levels 0 through 7.
- **Resolution**: Base map is 21620x14461 pixels.
- **Styling**: Applied contrast and brightness filters in Tailwind to enhance "fantasy atlas" readability.

### 2. Location Layer (Markers)
- Markers are dynamically rendered from `savedLocations` in `useWorldStore`.
- **Zoom-Dependent Visibility**:
    - **Z0+**: Major Cities (e.g., Baldur's Gate, Waterdeep).
    - **Z2+**: Towns, Large Settlements, Villages.
    - **Z4+**: Fortresses, Keeps, Castles, Towers.
    - **Z5+**: POIs, Ruins, Dungeons, Caves, Temples, Geographic features.
    - **Z6+**: All remaining minor locations.

### 3. Icon System
- Markers use the `WORLD_ATLAS_ICONS` registry (SVG path strings).
- Icons are color-coded and styled via Tailwind classes in `WorldMap.tsx`.
- **Dynamic Interaction**: Hovering triggers tooltips; clicking opens the World Panel and sets the `inspectedLocation`.
- **Visual Feedback**: Inspected locations receive a rotating dashed ring and a slight scale increase.

### 4. Party Layer
- A unique blue pulsing marker representing the group's current position (`partyLocation`).
- Includes a floating "Party" label for immediate identification.
- Triggering the party marker opens a specific party inspection view in the World Panel.

## 🛠️ Coordinate Calibration

The map uses `L.CRS.Simple` with a custom transformation to align logical coordinates with physical tiles.

### Scaling Logic
Coordinates from the legacy prototype (4763 x 3185) are rescaled to the high-resolution pixel space (21620 x 14461):
- **X Scaling**: `(x / 4763) * 21620`
- **Y Scaling**: `(y / 3185) * 14461`

The map uses a Top-Down coordinate system (0,0 is Top-Left) to match the standard tile generation output. This is achieved via `L.Transformation(1/128, 0, 1/128, 0)`, which scales the high-resolution pixels to the 256px tile space at Zoom 0.

> [!CAUTION]
> **CRITICAL: `scaleFactorValue` MUST BE EXACTLY 128.**
> Do NOT change the `scaleFactorValue` to attempt to resize the map or make it fit the screen. The value `128` is derived directly from the tile generator (which used a 32768x32768 virtual canvas for Zoom 7 where tiles are 1-to-1 with pixels). Changing this value will completely break the alignment between the map markers/bounds and the underlying tile images, causing the map to render "too small" or offset compared to the markers.
> If you need the map to appear larger on screen by default, change the `initialZoom` instead.

### Invalidation & Layout
The map automatically calls `invalidateSize()` during sidebar/panel transitions (Character Panel, Inventory, World Panel) to ensure the viewport remains accurate when the UI layout changes.
