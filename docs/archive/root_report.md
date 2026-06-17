Rapport: root/game-code review
Laatste update: 2026-06-05
Repo: japiohopman/artificer
Scope: root van de repo, game-code, server, services, store, inventory/save flow, tools en documentatie.

Dit rapport is bedoeld als aanvulling op:

todo.txt
RAPPORT_SAVE_SLOTS.md
Korte conclusie
De repo is duidelijk verder dan alleen een assets-map. Er staat nu een echte React/Vite game-app met:

Express dev/server layer
React 19 + Vite
Zustand store
DnD-kit inventory UI
Gemini AI services
Firebase setup/rules
asset normalisatie/validatie scripts
v2 inventory types met item instances, containers en slots
gegenereerde indexes, waaronder public/assets/atlas/equipment/index.json
De goede richting is zichtbaar: de v2 inventory architectuur uit het save/slot rapport is al deels ingevoerd. Maar de code zit nu in een overgangsfase waarin v1 en v2 tegelijk bestaan. Dat is op dit moment de grootste technische bron van bugs.

De belangrijkste risico's:

Server endpoints kunnen willekeurige GitHub fetch/commit/delete acties uitvoeren zonder duidelijke app-auth guard.
vite.config.ts expose't environment values naar client code, inclusief GEMINI_API_KEY.
Character save/inventory is half v1, half v2.
DEFAULT_CHARACTERS bevat dubbele object keys zoals items, containers en equipment.
Equipment/inventory UI hydrateert templates per item via netwerk calls, wat traag en fragiel wordt.
Asset validation bestaat, maar path resolving is nog niet correct voor public/assets/... references.
Documentatie is deels verouderd ten opzichte van de nieuwe v2 save/inventory richting.
Wat al goed is
[x] Er is een duidelijke app-root met package.json, server.ts, src/, tools/, Firebase rules en documentatie.

[x] src/types/inventory.ts bevat al een v2 model:

ItemInstance
InventorySlot
InventoryContainer
EQUIPMENT_SLOT_CATALOG
[x] Tool/focus/quick/accessory slots zijn al begonnen:

tool_1 t/m tool_5
focus
quick_1 t/m quick_4
acc_1 t/m acc_4
[x] src/lib/inventoryUtils.ts heeft helpers voor:

item instance ids
item kind afleiding
default equipment slots
default backpack slots
[x] Er is een tools/validateAssets.cjs. Dat is precies de juiste richting.

[x] Er is een tools/generateEquipmentIndex.cjs en een public/assets/atlas/equipment/index.json. Dat is een belangrijke stap richting sneller en betrouwbaarder laden.

Bevindingen met hoge prioriteit
1. Server commit/delete endpoints zijn te breed en te gevaarlijk
Bestanden:

server.ts
src/services/storageService.ts
server.ts expose't:

GET /api/fetch?url=...
GET /api/raw?url=...
POST /api/commit
POST /api/delete
De commit/delete endpoints gebruiken GITHUB_TOKEN en GITHUB_REPO, maar uit de gelezen code blijkt geen user-auth, role-check, path allowlist of CSRF-achtige guard.

Risico:

Elke client die de server kan bereiken kan mogelijk /api/commit aanroepen.
Een client kan mogelijk naar willekeurige paden in de repo schrijven.
Een client kan mogelijk willekeurige paden verwijderen.
Lokale write/delete gebruikt path.join(process.cwd(), filePath) zonder harde workspace/path allowlist.
Aanbevolen fix:

Maak commit/delete alleen beschikbaar in development of admin/devkit mode.
Voeg auth/role check toe voordat commit/delete mag.
Voeg path allowlist toe, bijvoorbeeld alleen:
public/assets/atlas/enemies/json/
public/assets/atlas/equipment/json/
data/character_save/json/
data/character_save/images/
Blokkeer .., absolute paths, backslashes en verdachte padsegmenten.
Gebruik server-side validatie per endpoint.
Overweeg aparte admin/devkit server in plaats van dezelfde game server.
Voorbeeld allowlist-denken:

const allowedPrefixes = [
  "data/character_save/json/",
  "data/character_save/images/",
  "public/assets/atlas/enemies/json/",
  "public/assets/atlas/equipment/json/"
];
2. Open proxy endpoints kunnen SSRF/data-leak problemen geven
Bestand:

server.ts
/api/fetch, /api/raw en /api/proxy-wiki accepteren een willekeurige url query parameter. In combinatie met server-side fetch is dit riskant.

Risico:

Server kan misbruikt worden als open proxy.
Interne metadata/IP endpoints kunnen mogelijk worden benaderd.
Als GITHUB_TOKEN wordt toegevoegd aan requests, wil je absoluut niet dat dit naar verkeerde hosts gaat.
Aanbevolen fix:

Sta alleen specifieke hosts toe:
api.github.com
raw.githubusercontent.com
eventueel specifieke wiki hosts
Check protocol: alleen https.
Strip credentials uit URL.
Voeg rate limiting toe.
Gebruik aparte endpoint shapes in plaats van vrije URL, bijvoorbeeld:
/api/github/raw?path=public/assets/...
/api/github/contents?path=...
3. GEMINI_API_KEY wordt client-side geïnjecteerd
Bestanden:

vite.config.ts
src/services/ai/config.ts
vite.config.ts doet:

define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
src/services/ai/config.ts gebruikt:

new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })
Omdat dit in client-bundled code zit, kan de key in de browser terechtkomen.

Risico:

API key kan zichtbaar worden in de build/bundle.
Iedereen die de app opent kan mogelijk requests doen op jouw key.
Aanbevolen fix:

Verplaats Gemini calls naar server endpoints.
Client stuurt alleen prompt/request naar jouw backend.
Backend gebruikt GEMINI_API_KEY.
Voeg auth/rate limits toe.
Als AI Studio bewust client-side keys injecteert, documenteer dat als development-only of user-provided-key flow. Voor een echte game deploy is server-side veiliger.

4. Character model is half v1 en half v2
Bestanden:

src/store/useStore.ts
src/services/saveService.ts
src/components/character/Inventory.tsx
src/components/character/EquipmentDoll.tsx
src/components/character/DraggableInventoryItem.tsx
Character bevat tegelijk:

inventory: Record<string, any | null>;
backpack: any[];
items?: Record<string, ItemInstance>;
containers?: Record<string, InventoryContainer>;
equipment?: { containerId: string; slots: InventorySlot[] };
Dat is logisch als tijdelijke migratie, maar er is nog geen harde migratiegrens. Veel componenten moeten daardoor saveVersion === 2 checks doen.

Risico:

Nieuwe features kunnen per ongeluk v1 data schrijven.
Saves kunnen hybride worden.
UI en state kunnen verschillende waarheid gebruiken.
Bugs worden lastig te reproduceren.
Aanbevolen fix:

Maak een expliciete migratiefunctie:
migrateCharacterSaveV1ToV2(character): CharacterV2
Roep die aan bij load.
Roep die ook aan vlak voor save als defensive fallback.
Laat UI vanaf dat moment alleen met v2 werken.
Houd legacy types tijdelijk, maar schrijf geen nieuwe v1 saves meer.
5. DEFAULT_CHARACTERS bevat dubbele keys
Bestand:

src/store/useStore.ts
In het eerste default character staan o.a. eerst:

items: {},
containers: {},
equipment: { containerId: 'equipment_char2', slots: [] },
inventory: {},
backpack: [],
En later opnieuw:

items: { ... },
containers: { ... },
equipment: { ... },
Risico:

TypeScript kan dit afkeuren als duplicate property names.
Als het toch draait, overschrijven latere keys eerdere keys stil.
Test/default data is onbetrouwbaar.
Aanbevolen fix:

Verwijder de eerste lege items, containers, equipment entries.
Of bouw default characters met een helper:
createCharacterV2({
  id: "char-1",
  items,
  containers,
  equipment
});
6. v2 equip/unequip acties muteren nested state te direct
Bestand:

src/store/useStore.ts
Voorbeeldpatronen:

const containers = { ...(char.containers || {}) };
const backpack = Object.values(containers).find(c => c.type === 'backpack');
if (slot) slot.itemId = newId;
backpack.slots = backpack.slots.map(...);
De top-level container map wordt gekopieerd, maar container objects en slot objects worden soms direct gemuteerd.

Risico:

Zustand updates kunnen werken, maar nested mutation maakt bugs subtiel.
React components kunnen minder voorspelbaar re-renderen.
Debugging/time-travel/testing wordt lastiger.
Aanbevolen fix:

Maak pure helperfuncties:
moveItemBetweenSlots(state, from, to)
equipItemToSlot(character, itemId, slotId)
unequipItem(character, slotId)
addItemToContainer(character, containerId, itemInstance)
Laat helpers nieuwe container/slot arrays teruggeven.
7. Equip validatie ontbreekt nog
Bestand:

src/store/useStore.ts
equipItem(itemOrItemId, slotId) zet in v2 een item in een slot als het slot bestaat. Er is nog geen duidelijke check op:

kind
equipSlots
requiredSlots
two-handed rules
shield/offhand conflict
focus/tool verschil
proficiency requirements
backpack vol wanneer swapping
Risico:

Elk item kan in elk slot terechtkomen als de UI dat triggert.
Two-handed/offhand regels breken.
Tools/foci worden inconsistent.
Aanbevolen fix:

Voeg canEquipItem(character, itemId, slotId, equipmentIndex) toe.
Gebruik slot catalogus + template equipSlots.
Laat equipItem alleen muteren als canEquipItem slaagt.
8. v2 inventory hydrateert templates per item
Bestand:

src/components/character/Inventory.tsx
De component haalt template details op via:

Object.values(activeCharacter.items || {}).forEach(inst => templates.add(inst.template));
...
await Promise.all(missing.map(async t => fetchEquipmentData(t)))
Risico:

Inventory openen kan veel netwerkcalls triggeren.
Rendering hangt af van async hydration.
Items die geen equipment zijn, worden mogelijk toch via equipment fetch geladen.
Performance wordt slechter bij grotere backpacks.
Aanbevolen fix:

Gebruik public/assets/atlas/equipment/index.json voor basis display data.
Laad detail JSON alleen bij inspect/focus.
Maak een centrale template cache/service.
Categoriseer item templates per atlas domein:
equipment
magic_items
crafting/materials
books/key items
9. Drag/drop data shape is nog niet volledig v2
Bestanden:

src/components/character/DraggableInventoryItem.tsx
src/components/character/Inventory.tsx
src/components/character/EquipmentDoll.tsx
DraggableInventoryItem gebruikt nog:

data: {
  item,
  sourceId,
  index,
  slot
}
Maar het gewenste model is:

data: {
  itemId,
  from: { containerId, slotId }
}
Risico:

UI sleept complete item data mee.
Source/target logica blijft character-centric in plaats van container-centric.
Containers zoals chest, pouch, corpse en merchant worden later speciale gevallen.
Aanbevolen fix:

Gebruik altijd containerId + slotId.
Gebruik itemId, niet heel item object.
Equipment is ook container: equipment_characterId.
10. Asset validator heeft path resolving problemen
Bestand:

tools/validateAssets.cjs
checkPath() behandelt refs die niet met / beginnen als relatief aan het JSON-bestand:

absolutePath = path.resolve(path.dirname(filePath), refPath);
Maar veel JSON refs zijn:

public/assets/atlas/equipment/json/longsword.json
Die worden dan foutief opgelost als:

public/assets/atlas/equipment/json/public/assets/atlas/...
Risico:

Validator meldt false positives.
Of teams gaan echte validatiefouten negeren omdat het script te veel ruis geeft.
Aanbevolen fix:

Herken public/assets/... expliciet en resolve vanaf repo root.
Herken /assets/... en resolve vanaf public/.
Herken atlas logical refs zonder .json apart.
Voeg categorie/url allowlist toe.
11. normalizeImageUrl maakt runtime afhankelijk van GitHub raw/proxy
Bestand:

src/services/storageService.ts
De app probeert veel lokale asset paths om te zetten naar raw GitHub URLs en daarna /api/raw.

Risico:

Lokale public assets worden niet optimaal gebruikt.
Cache busting via Date.now() veroorzaakt veel onnodige requests.
Offline/local builds werken slechter.
De server proxy wordt onnodig belast.
Aanbevolen fix:

Voor public assets: gebruik /assets/....
Gebruik GitHub raw alleen in devkit/import workflows.
Maak normalizeImageUrl minder agressief.
Gebruik equipment/index.json image paths.
12. Firestore rules zijn goed bedoeld, maar character validatie is te zwak voor v2 saves
Bestand:

firestore.rules
isValidCharacter(data) checkt alleen:

name
class
race
Risico:

Hele v2 save shape wordt niet gevalideerd.
Grote of verkeerde nested data kan alsnog door.
SaveVersion/items/containers/equipment worden niet afgedwongen.
Aanbevolen fix:

Voeg limieten toe op:
items map size
containers map size
slots per container
string lengths
allowed top-level keys
Of bewaar game saves via server-side validation in plaats van alleen Firestore rules.
Middelgrote bevindingen
13. useStore.ts is te groot
Bestand:

src/store/useStore.ts
Het bestand is ongeveer 61 KB en bevat:

types
default characters
UI state
audio state
inventory actions
character actions
spell actions
async data loading
Firebase profile update
Risico:

Moeilijk te testen.
Moeilijk te refactoren.
Elke feature raakt hetzelfde centrale bestand.
Aanbevolen opsplitsing:

store/slices/navigationSlice.ts
store/slices/characterSlice.ts
store/slices/inventorySlice.ts
store/slices/audioSlice.ts
store/slices/atlasSlice.ts
store/slices/authSlice.ts
14. Grote componenten zijn moeilijk onderhoudbaar
Voorbeelden:

src/components/devkit/DevKit.tsx ~126 KB
src/components/character/CharacterProfile.tsx ~96 KB
src/components/devkit/npc_generator.tsx ~81 KB
src/components/ArcaneCodex.tsx ~60 KB
src/components/character/CharacterCreator/EquipmentStep.tsx ~51 KB
Risico:

UI bugs zijn moeilijk te isoleren.
Performance optimalisaties zijn lastiger.
Co-pilot/AI edits worden onveiliger omdat context te breed is.
Aanbevolen aanpak:

Split per view/panel/action.
Extract hooks:
useInventoryHydration
useEquipmentActions
useCharacterSave
useDevkitCommit
Extract pure mappers:
mapAtlasEquipmentToTemplate
mapLegacySaveToV2
15. Documentatie is deels verouderd
Bestanden:

README.md
documentation.md
Voorbeelden:

README is nog AI Studio boilerplate.
documentation.md noemt character inventory en backpack als core model, maar v2 model bestaat nu al.
viewMode documentatie noemt andere waarden dan de code.
Aanbevolen fix:

Update README naar project-specifiek:
wat is Artificer/Arcane Codex
dev setup
env vars
scripts
security warning voor devkit endpoints
Update documentation.md met v2 inventory/save model.
16. Package scripts missen asset tooling
Bestand:

package.json
Er zijn tools voor validation/generation, maar scripts bevatten alleen:

dev
build
preview
clean
lint
Aanbevolen scripts:

{
  "validate:assets": "node tools/validateAssets.cjs",
  "generate:equipment-index": "node tools/generateEquipmentIndex.cjs",
  "generate:spell-index": "node tools/generateSpellIndex.cjs",
  "generate:enemy-index": "node tools/generateEnemyIndex.cjs",
  "normalize:assets": "node tools/normalizeAllAssets.cjs",
  "check": "npm run lint && npm run validate:assets"
}
17. TypeScript strictness staat niet aan
Bestand:

tsconfig.json
strict staat niet aan. Er is veel any in core flows.

Risico:

Legacy/v2 data mengt zonder compiler waarschuwing.
Slot ids en item kinds worden minder goed beschermd.
Refactors blijven riskant.
Aanbevolen gefaseerd:

Zet noImplicitAny nog niet meteen aan als dat te veel breekt.
Begin met strictere types op inventory/save modules.
Maak CharacterV1, CharacterV2, CharacterSave.
Gebruik discriminated unions.
Positieve ontwikkeling rond slots
src/types/inventory.ts heeft al goede ingrediënten:

main_hand
off_hand
ranged
ammo
chest
clothes
tool_1 t/m tool_5
focus
quick_1 t/m quick_4
Wel opletten:

pouch is als equipment slot toegevoegd. Prima als wearable pouch slot, maar een pouch item zelf moet ook een containerId kunnen hebben.
acc_1..acc_4 is handig, maar maak duidelijk wat verschil is met rings/neck/belt.
extra staat nog in EquipmentDoll.ItemSlot, maar hoort niet als equipment slot in saves.
Aanbevolen slot-catalogus uitbreiden met accept rules:

{
  id: "focus",
  accepts: {
    kinds: ["focus"],
    focusTypes: ["arcane", "druidic", "holy_symbol"]
  }
}
{
  id: "tool_1",
  accepts: {
    kinds: ["tool"]
  }
}
Aanbevolen implementatievolgorde
Scherm server.ts commit/delete/raw/fetch endpoints af.
Verplaats Gemini API calls naar server-side endpoints.
Fix DEFAULT_CHARACTERS duplicate keys.
Maak CharacterV1 en CharacterV2 types expliciet.
Bouw migrateCharacterV1ToV2.
Laat saveService.loadCharacters() altijd v2 teruggeven.
Laat saveService.saveCharacter() alleen v2 opslaan.
Maak inventory actions pure en container-centric.
Voeg canEquipItem() toe met slot accept rules.
Laat DnD-kit data werken met containerId + slotId + itemId.
Fix tools/validateAssets.cjs path resolving.
Voeg package scripts toe voor validation/generation.
Update README/documentation.
Split useStore.ts in slices.
Split grote componenten in kleinere modules/hooks.
Specifieke TODO's voor co-pilot
[ ] In server.ts: maak URL allowlist voor /api/fetch, /api/raw, /api/proxy-wiki.

[ ] In server.ts: maak path allowlist voor /api/commit en /api/delete.

[ ] In server.ts: blokkeer .., absolute paths en backslash path traversal in commit/delete payloads.

[ ] In vite.config.ts en src/services/ai/config.ts: haal GEMINI_API_KEY uit client bundle.

[ ] In src/store/useStore.ts: verwijder duplicate items, containers, equipment keys uit DEFAULT_CHARACTERS.

[ ] In src/store/useStore.ts: verplaats legacy/v2 migratie naar aparte helper.

[ ] In src/store/useStore.ts: maak equipItem, unequipItem, transferItem, addToBackpack, removeFromBackpack pure v2 helpers.

[ ] In src/components/character/DraggableInventoryItem.tsx: verander drag payload naar itemId, containerId, slotId.

[ ] In src/components/character/Inventory.tsx: gebruik index data voor list rendering; fetch full template alleen bij inspect.

[ ] In src/types/inventory.ts: voeg slot accept rules toe aan catalogus.

[ ] In src/types/inventory.ts: beslis of pouch een equipment slot blijft of alleen een container item is.

[ ] In src/components/character/EquipmentDoll.tsx: verwijder extra als equipment slot.

[ ] In tools/validateAssets.cjs: fix resolving voor public/assets/... en /assets/....

[ ] In package.json: voeg scripts toe voor asset validation en index generation.

[ ] In documentation.md: update Character model naar v2 registry/containers/equipment slots.

Eindadvies
De root-code laat zien dat je de goede architectuurrichting al hebt ingezet. De v2 inventory types en slots zijn er. Nu moet de overgang worden afgerond.

De grootste winst komt niet uit nieuwe features, maar uit het verwijderen van dubbelzinnigheid:

geen v1 writes meer
geen volledige item templates in saves
geen open commit/delete endpoints zonder guard
geen Gemini key in client bundle
geen free-form item/slot strings zonder catalogus
geen GitHub raw proxy als standaard image loading voor lokale public assets
Als deze basis staat, wordt de rest van de D&D game veel makkelijker: chests, pouches, merchants, corpse loot, tool checks, spellcasting foci, quick slots, two-handed weapons en save migration kunnen dan allemaal op hetzelfde systeem draaien.
