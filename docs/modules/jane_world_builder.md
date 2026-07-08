Building Module

## Purpose
The World Building module, spearheaded by the **Jane Agent**, is responsible for the procedural and manual creation of the physical environment in Artificer. This includes **all location types** defined in the atlas: cities, settlements, roads, forests, mountains, waters, wetlands, regions, and interior locations like shops.

## Owner
Jane Agent (World Builder)

## Dependencies
- `atlasService.ts`: For fetching existing world data and schemas.
- `server.ts` (Commit Proxy): For persisting data to the repository.
- Google Gemini API: For generating descriptions and location images.
- **Universal Schemas**: Adheres to all location-based schemas in `public/assets/atlas/schemas/` (e.g., `city.schema.json`, `forest.schema.json`, `mountain.schema.json`, etc.).

## Architecture
The module follows a "Bake-to-Reality" pattern, with a mandatory requirement for structural integrity and data alignment across all geographic scales.

1. **Definition**: The agent or user defines a location's metadata, selecting the appropriate schema type (City, Road, POI, etc.).
2. **Synthesis**: The AI generates rich Markdown descriptions and atmospheric images.
3. **Lore Alignment**: (Mandatory) Newly generated lore must be cross-referenced with existing atlas data to prevent narrative contradictions and duplicate entries.
4. **Validation**: (Mandatory) Every location must pass strict JSON schema validation relevant to its type before it can be persisted.
5. **Persistence**: The validated data and generated assets are committed to the repository via the `/api/commit` proxy. Locations are saved in their respective type-specific directory (e.g., `forests/`, `mountains/`).

## API / Endpoints
- `POST /api/commit`: Commits JSON data and Base64 images to the specified path.
- `POST /api/ai/generate-content`: Uses Gemini to synthesize lore and descriptions.
- `POST /api/ai/generate-image`: Uses the Gemini image model to create atmospheric visuals.

## Data Structures
Locations are stored hierarchically:
- `world/[plane]/[continent]/regions/[region]/`: Top-level regional data.
- `world/[plane]/[continent]/cities/[city_id]/`: Major city data.
- `world/[plane]/[continent]/towns_settlements/[town_id]/`: Town and village data.
- `world/[plane]/[continent]/roads_trails/[road_id]/`: Route and path data.

## Known Issues
- Image generation consistency needs careful prompting to match the "Parchment & Dragonstone" aesthetic.
- Schema validation must be strictly enforced before committing.

## TODO's
- [ ] Implement a visual Map Editor for setting coordinates.
- [ ] Add support for "District" sub-locations within cities.
- [ ] Create a "Shop Template" for consistent merchant generation.
