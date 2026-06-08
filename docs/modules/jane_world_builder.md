# Jane: World Building Module

## Purpose
The World Building module, spearheaded by the **Jane Agent**, is responsible for the procedural and manual creation of the physical environment in Artificer. This includes cities, settlements, roads, landmarks, and interior locations like shops.

## Owner
Jane Agent (World Builder)

## Dependencies
- `atlasService.ts`: For fetching existing world data and schemas.
- `server.ts` (Commit Proxy): For persisting data to the repository.
- Google Gemini API: For generating descriptions and location images.
- `city.schema.json` & `sub_region.schema.json`: For structural validation.

## Architecture
The module follows a "Bake-to-Reality" pattern:
1. **Definition**: The agent or user defines a location's metadata.
2. **Synthesis**: The AI generates rich Markdown descriptions and atmospheric images.
3. **Validation**: The data is validated against the appropriate JSON schema.
4. **Persistence**: The validated data and generated assets are committed to the repository via the `/api/commit` proxy.

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
