# Map Zoom Levels & Legend System Specification

## Zoom System Overview
The map implements a 7-tier zoom system (User Levels 0-6). These are mapped to Leaflet's internal zoom levels 3-9.

| User Level | Leaflet Zoom | Scale (Miles) | Visibility Focus |
|------------|--------------|---------------|------------------|
| 0          | 3            | 4001          | World Overview (Regions Only) |
| 1          | 4            | 2001          | Oceans & Seas, Cities (Major) |
| 2          | 5            | 1001          | Major Terrain (Forests, Mountains, Plains, etc.) |
| 3          | 6            | 501           | Detailed Regions |
| 4          | 7            | 251           | Towns, Settlements, Keeps, Fortresses |
| 5          | 8            | 130           | Landmarks, Temples, Shrines |
| 6          | 9            | 70            | Ruins, POIs, Dungeons, Hidden Sites, Roads |

## Coordinate System
- **Source:** Faerûn High-Res Map (21620 x 14461 pixels).
- **Transformation:** `L.Transformation(1/128, 0, 1/128, 0)`.
- **Mapping:** 1 native pixel = 1 LatLng unit.
- **Scale:** 128 LatLng units = 1 tile (256px) at Zoom 0 (Leaflet Zoom 0).
- **Geographic Scale:** 4763 Proto Units = 4000 Miles.

## Data Loading (Progressive Loader)
Atlas data is loaded progressively based on the current zoom level to optimize performance.
- When `currentZoom` reaches a tier's threshold, the corresponding `.json` files are fetched from `/assets/atlas/world/toril/faerun/{category}/{category}.json`.
- The `useWorldStore` tracks `loadedCategories` to prevent redundant fetches.
- **Note:** The `resetAtlas` action is called on `WorldMap` initialization to ensure fresh data.

## Layer Visibility Rules
- **Oceans:** Visible at User Level 1+ (Leaflet 4+). Labels are permanent and styled as blue italicized text.
- **Terrain:** Visible at User Level 2+ (Leaflet 5+). Includes Forests, Mountains, Plains, Wetlands, Oases, etc.
- **Major Cities:** Visible once loaded. Permanent labels at User Level 3+ (Leaflet 6+).
- **Towns/Settlements:** Visible at User Level 4+ (Leaflet 7+).
- **Landmarks:** Visible at User Level 5+ (Leaflet 8+).
- **POIs/Ruins:** Visible only at maximum zoom (User Level 6 / Leaflet 9).

## Legend Behavior
- **Placement:** Floating overlay in `GameScreen.tsx` (`z-[300]`), positioned above the Chat Panel area.
- **Behavior:**
    - Toggled via the Legend button (map icon) in the Control Hub.
    - Icons highlight dynamically based on whether they are visible at the current zoom level.
    - Hovering over an icon shows its name and the required zoom level if locked.

## UI Styling
- **Labels:** Parchment style. Dark brown text (`#2b1d0e`) with light tan outline (`#f3e5ab`). No boxed borders.
- **Markers:** SVG icons from `WORLD_ATLAS_ICONS` registry.
- **Scale:** Displays dynamic distance in Miles (e.g., "500 Miles") based on the current zoom level.

## Rendering Order (Z-Index)
1. Tile Layer
2. Regional SVG Overlays (Zoom 3 only)
3. Terrain Markers (500)
4. Settlement Markers (3000)
5. City Markers (4000)
6. Major City Markers (5000)
7. Party Marker (2000)
8. Inspected Location (1000 offset)
