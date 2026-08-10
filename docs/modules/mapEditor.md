BattleMapEditor — volledige herbouw als professionele Artificer DevKit-module

We gaan de huidige src/components/devkit/BattleMapEditor.tsx volledig herstructureren en uitbouwen tot een volwaardige Battle Map Authoring Editor voor Artificer.

De huidige component is slechts een prototype. Niet verder uitbreiden als één groot TSX-bestand.

De editor moet uiteindelijk functioneren als een combinatie van:

Dungeon Scrawl
Dungeon Map Builder
een lichte Dungeondraft-achtige authoring workflow
én specifiek de tactische combat requirements van Artificer.

Referenties:

Dungeon Scrawl
Dungeon Map Builder
1. Eerst de bestaande Artificer-architectuur analyseren

Voordat je code wijzigt, inspecteer:

src/components/devkit/BattleMapEditor.tsx
src/components/devkit/DevKit.tsx
src/components/combat/CombatGrid.tsx
src/components/combat/combatUtils.ts
src/components/combat/Token.tsx
src/store/useGameStore.ts
src/store/useUIStore.ts
src/store/useWorldStore.ts
src/store/useAtlasStore.ts
relevante atlas services
bestaande asset loading/indexing
docs/systems/TACTICAL_COMBAT_ENGINE.md
docs/systems/DATA_FLOW.md
docs/COMPONENT_MAP.md

Gebruik de bestaande Artificer-architectuur en data waar mogelijk.

Niet opnieuw een parallel combat-systeem bouwen.

Artificer gebruikt een state-first architectuur waarbij UI-componenten state projecteren en stores de regels afdwingen.

De Battle Map Editor is echter primair een authoring tool. Maak daarom onderscheid tussen:

Battle Map Authoring Data
        ↓
saved map definition
        ↓
CombatGrid runtime representation

De editor mag dus niet alle editor-state rechtstreeks in useGameStore dumpen.

2. Verander de structuur

Verwijder de monolithische architectuur van:

src/components/devkit/BattleMapEditor.tsx

en maak:

src/components/devkit/BattleMapEditor/
├── BattleMapEditor.tsx
├── index.ts
│
├── components/
│   ├── EditorToolbar.tsx
│   ├── ToolPalette.tsx
│   ├── MapCanvas.tsx
│   ├── MapViewport.tsx
│   ├── LayerPanel.tsx
│   ├── InspectorPanel.tsx
│   ├── AssetPanel.tsx
│   ├── GridSettings.tsx
│   ├── MapSettings.tsx
│   ├── SelectionOverlay.tsx
│   ├── ContextMenu.tsx
│   ├── StatusBar.tsx
│   └── dialogs/
│       ├── NewMapDialog.tsx
│       ├── ExportMapDialog.tsx
│       └── MapPropertiesDialog.tsx
│
├── tools/
│   ├── ToolManager.ts
│   ├── selectTool.ts
│   ├── brushTool.ts
│   ├── wallTool.ts
│   ├── roomTool.ts
│   ├── doorTool.ts
│   ├── terrainTool.ts
│   ├── objectTool.ts
│   ├── tokenTool.ts
│   ├── measureTool.ts
│   ├── textTool.ts
│   ├── eraserTool.ts
│   └── panTool.ts
│
├── hooks/
│   ├── useBattleMapEditor.ts
│   ├── useEditorHistory.ts
│   ├── useEditorSelection.ts
│   ├── useEditorViewport.ts
│   ├── useEditorKeyboard.ts
│   └── useEditorPointer.ts
│
├── state/
│   ├── editorTypes.ts
│   ├── editorStore.ts
│   └── editorDefaults.ts
│
├── rendering/
│   ├── renderMap.ts
│   ├── renderGrid.ts
│   ├── renderWalls.ts
│   ├── renderDoors.ts
│   ├── renderTerrain.ts
│   ├── renderObjects.ts
│   ├── renderTokens.ts
│   ├── renderSelection.ts
│   └── renderFog.ts
│
├── geometry/
│   ├── coordinates.ts
│   ├── snapping.ts
│   ├── bounds.ts
│   ├── hitTesting.ts
│   ├── lineOfSight.ts
│   └── measurements.ts
│
├── commands/
│   ├── EditorCommand.ts
│   ├── AddObjectCommand.ts
│   ├── DeleteObjectCommand.ts
│   ├── MoveObjectCommand.ts
│   ├── ResizeMapCommand.ts
│   └── PaintCellsCommand.ts
│
├── persistence/
│   ├── mapSerializer.ts
│   ├── mapDeserializer.ts
│   ├── mapSchema.ts
│   └── mapValidation.ts
│
├── types/
│   ├── battleMap.ts
│   ├── mapObject.ts
│   ├── mapLayer.ts
│   ├── mapTool.ts
│   └── mapTerrain.ts
│
└── utils/
    ├── ids.ts
    └── clipboard.ts

De exacte onderverdeling mag aangepast worden als de bestaande projectstructuur daar een betere oplossing voor biedt.

Hoofdregel: BattleMapEditor.tsx mag uiteindelijk alleen composition/orchestration bevatten.

3. Belangrijk architectuurbesluit: walls zijn GEEN gewone cellen

De huidige editor gebruikt:

Set<string>

zoals:

"4,5"
"4,6"

voor walls.

Dat moet worden vervangen.

Een wall hoort conceptueel tussen twee cellen te zitten.

Bijvoorbeeld:

type WallSegment = {
  id: string;
  orientation: 'horizontal' | 'vertical';
  x: number;
  y: number;
  type: 'wall' | 'door' | 'secret-door';
  doorState?: 'open' | 'closed' | 'locked';
};

Dus:

      cell
   ┌───────┐
   │       │
wall      wall
   │       │
   └───────┘
      wall

Dit is belangrijk voor:

correcte LoS
deuren
corridors
openings
pathfinding
cover
toekomstige lighting
collision
DD2VTT/Foundry-achtige export
verschillende wall thicknesses

Geen wall-cell model meer als primaire representatie.

4. Maak een echte BattleMap data model

Ontwerp een expliciet, versioned schema.

Bijvoorbeeld:

interface BattleMap {
  version: 1;

  id: string;
  name: string;

  metadata: {
    description?: string;
    author?: string;
    createdAt: string;
    updatedAt: string;
  };

  dimensions: {
    width: number;
    height: number;
  };

  grid: {
    type: 'square' | 'hex';
    cellSize: number;
    unit: 'ft' | 'm';
    visible: boolean;
    snap: boolean;
  };

  background: {
    type: 'color' | 'texture' | 'image';
    value?: string;
    opacity?: number;
  };

  terrain: TerrainCell[];

  walls: WallSegment[];

  rooms: MapRoom[];

  doors: MapDoor[];

  objects: MapObject[];

  tokens: MapToken[];

  labels: MapLabel[];

  lights: MapLight[];

  fogOfWar?: FogDefinition;

  entrances: MapMarker[];

  exits: MapMarker[];

  layers: MapLayer[];
}

Gebruik stabiele IDs.

Gebruik geen Map<string, string> als persistence model.

5. Layers

De editor moet echte layers ondersteunen.

Minimaal:

Background
Terrain
Rooms/Floors
Walls
Doors
Objects
Lighting
Fog of War
Tokens
Labels
DM Notes

Elke layer moet:

zichtbaar/onzichtbaar
locked/unlocked
selectable
eventueel opacity
ordering/z-index

kunnen hebben.

De Layer Panel moet lijken op een professionele map editor en niet op een lijst met buttons.

6. Canvas viewport

Gebruik een Canvas-based editor voor het mapoppervlak.

Artificer gebruikt Canvas al voor CombatGrid, dus dit sluit aan bij de bestaande architectuur.

De viewport moet ondersteunen:

Zoom
25%
50%
75%
100%
125%
150%
200%
300%
400%

plus mouse-wheel zoom.

Pan
middle mouse
space + left mouse
pan tool
Zoom around cursor

Niet simpelweg naar het midden van het canvas zoomen.

De positie onder de cursor moet tijdens zoom behouden blijven.

Fit to screen

Shortcut:

F

of een passende bestaande shortcut als Artificer daar al conventies voor heeft.

7. Editor workflow

De UX moet ongeveer:

┌──────────────────────────────────────────────────────────────┐
│ File   Edit   View   Grid   Map   Export                    │
├──────────────────────────────────────────────────────────────┤
│ Select │ Wall │ Room │ Door │ Terrain │ Object │ Token │ ...│
├───────────┬───────────────────────────────────┬──────────────┤
│           │                                   │              │
│ TOOL      │                                   │ INSPECTOR    │
│ PALETTE   │             MAP CANVAS            │              │
│           │                                   │              │
│           │                                   │              │
├───────────┴───────────────────────────────────┴──────────────┤
│ Layers                         │ zoom │ x │ y │ grid │ snap   │
└──────────────────────────────────────────────────────────────┘

Niet alles tegelijk in één sidebar proppen.

8. Tools

Maak een echte tool architecture.

Minimaal:

Select
single click
drag selection
multi-select
shift select
ctrl/cmd select
move
resize
rotate waar relevant
delete
Pan
Wall

Ondersteun:

click
drag
line
rectangle
freehand waar zinvol
snap to grid
Room

Rectangle room:

drag → room

Maar ook:

polygon room
corridor
irregular room
Door

Deur moet op een wall segment kunnen worden geplaatst.

Properties:

Open
Closed
Locked
Secret
Terrain

Brush:

stone
wood
water
grass
sand
lava
ice
mud

De exacte lijst moet aansluiten op bestaande Artificer assets/data waar mogelijk.

Object / Stamp

Plaats assets uit:

public/assets/

of bestaande Atlas/asset infrastructuur.

Voorbeelden:

crate
barrel
table
chair
pillar
tree
rock
chest
altar
torch
statue

Objecten moeten:

move
scale
rotate
delete
duplicate
lock

ondersteunen.

Dungeon Scrawl heeft inmiddels juist veel nadruk op stamps/assets, shadows en object locking; dat is een goede UX-richting om over te nemen zonder de implementatie letterlijk te kopiëren.

Token / Spawn

Niet alleen "enemy".

Gebruik:

Player Spawn
NPC Spawn
Enemy Spawn
Monster
Neutral
Encounter Marker

Waar mogelijk moet een Monster kunnen worden gekoppeld aan Atlas-data in plaats van alleen:

"Orc Sentry"

De bestaande editor doet dit nu hardcoded. Dat moet verdwijnen.

Measure

Meet:

5 ft
10 ft
15 ft
...

en toon eventueel:

30 ft / 6 squares
Text

Plaats labels:

"Throne Room"
"Secret Passage"
"Trap"

met:

font size
alignment
color
optional shadow
rotation
Eraser

Context-aware verwijderen.

9. Grid

Ondersteun:

Square
Hex
None

Voor square:

5 ft
10 ft
15 ft

Grid properties:

cell size
opacity
line width
color
subdivisions
snap

Maak grid rendering onafhankelijk van map rendering.

10. Selection system

Dit is essentieel.

Maak één centrale selectie:

type EditorSelection = {
  ids: string[];
  type:
    | 'cell'
    | 'wall'
    | 'door'
    | 'object'
    | 'token'
    | 'room'
    | 'label'
    | null;
};

De Inspector toont properties van de selectie.

Bijvoorbeeld:

SELECTED OBJECT

Torch

Position
X 12
Y 8

Rotation
90°

Scale
1.0

Layer
Objects

Shadow
✓

Locked
□
11. Undo / Redo

Dit moet vanaf het begin goed worden ontworpen.

Niet:

setState(...)

zonder history.

Gebruik een command/history systeem.

Ondersteun:

Ctrl+Z
Ctrl+Shift+Z
Ctrl+Y

Elke betekenisvolle editoractie moet undoable zijn.

Bijvoorbeeld:

Paint wall
Move object
Delete object
Resize map
Change terrain
Add door
Rotate object

Gebruik bij voorkeur immutable snapshots of commands; kies wat qua performance en bestaande Artificer-stack het beste past.

12. Keyboard shortcuts

Minimaal:

V = Select
B = Brush
W = Wall
R = Room
D = Door
T = Terrain
O = Object
M = Measure
E = Eraser
Space = Pan

Ctrl+Z = Undo
Ctrl+Y = Redo
Delete = Delete selection
Escape = Cancel tool
Ctrl+C = Copy
Ctrl+V = Paste
Ctrl+D = Duplicate

+ / - = Zoom
0 = Reset zoom
F = Fit map

Zorg dat shortcuts niet conflicteren met bestaande DevKit/global shortcuts.

13. Map resizing

De gebruiker moet een map kunnen maken:

16 × 12
32 × 20
40 × 30
50 × 50
100 × 100

maar ook custom dimensions.

Bij resize:

bestaande content behouden waar mogelijk
niet zomaar state vernietigen
undoable maken
14. Generator

Voeg een eenvoudige generator toe.

Niet meteen een gigantische procedural-generation engine.

V1:

Generate Dungeon
Generate Rooms
Generate Corridors
Generate Cave

Properties:

Width
Height
Room count
Room min size
Room max size
Corridor width
Seed

Belangrijk:

Seed opslaan.

Dus:

generator: {
  type: 'dungeon';
  seed: 183742;
}

zodat dezelfde map reproduceerbaar is.

15. Asset browser

Maak een asset panel.

Gebruik bestaande Artificer asset infrastructuur.

Niet zelf een compleet tweede asset systeem maken.

Ondersteun:

Search
Category
Tags
Favorites
Preview
Drag & Drop

Drag asset naar canvas.

Voorbeelden:

Props
Furniture
Nature
Dungeon
Ruins
Torches
Doors
Decorations
Monsters
Markers

Als useAtlasStore, atlasService of bestaande asset indexing dit al kan leveren, hergebruik dat.

16. Map metadata

Een map moet niet alleen een afbeelding zijn.

Ondersteun:

Map name
Description
Location ID
Region
Encounter ID
Recommended level
Environment
Grid size
Scale
Theme

Voor Artificer is dit belangrijk omdat een battlemap uiteindelijk gekoppeld kan worden aan:

World Location
Encounter
Combat
NPCs
Monsters
Doors
Entrances
Exits
17. Artificer combat integration

De editor mag geen tweede CombatGrid worden.

De relatie moet zijn:

BattleMapEditor
       ↓
BattleMap JSON
       ↓
Map Loader / Adapter
       ↓
CombatState
       ↓
CombatGrid

Maak hiervoor een adapter, bijvoorbeeld:

persistence/
    battleMapToCombatGrid.ts

Deze vertaalt authoring data naar het bestaande runtime model.

Bijvoorbeeld:

wall
door closed
terrain
spawn point
monster placement

naar de data die CombatGrid verwacht.

De bestaande Tactical Combat Engine beschrijft al 32×20, 5 ft/cell, integer [x,y], walls, doors, LoS en A* als kernconcepten.

18. LoS en cover

De huidige cover calculator mag niet de architecturale kern van de editor worden.

De editor moet geometrie opslaan.

Maak aparte utilities voor:

lineOfSight()
rayIntersectsWall()
calculateCover()
getBlockingWalls()

Gebruik dezelfde geometrische conventies als CombatGrid.

Cover moet uiteindelijk gebaseerd zijn op echte wall/door geometry, niet op:

blockedCellsCount / totalCells

zoals de prototypeversie nu doet.

19. Fog of War

Maak een aparte layer.

Ondersteun minimaal:

Hidden
Revealed
Explored

Editor tools:

Reveal
Hide
Erase

De runtime kan deze informatie later gebruiken.

20. Save / Load / Export

Minimaal:

Native map format
.battlemap.json

of een vergelijkbaar Artificer-native formaat.

JSON export

Voor debugging en portability.

PNG/WebP

Render de map naar image.

Runtime export

Een map moet zonder editor kunnen worden ingeladen door de game.

21. Autosave / persistence

Ontwerp de editor zo dat later eenvoudig:

localStorage
Firebase
GitHub saveService

kan worden toegevoegd.

Gebruik hiervoor een persistence abstraction.

Niet rechtstreeks overal:

localStorage.setItem(...)

zetten.

22. Performance

Dit kan een grote module worden.

Daarom:

Niet voor elke cel een React component.

Gebruik Canvas voor:

grid
terrain
walls
doors
fog
selection
highlights
measurements

Gebruik React alleen voor:

toolbar
panels
inspector
menus
overlays
eventueel geselecteerde object controls

Gebruik memoization waar zinvol.

De bestaande CombatGrid gebruikt al een hybride Canvas + React architectuur; volg dat principe.

23. Geen onnodige dependency toevoegen

Controleer eerst package.json.

Artificer heeft al:

React
Zustand
Framer Motion/Motion
dnd-kit
Lucide
Tailwind

enzovoort.

Voeg geen grote editor library zoals een complete canvas editor toe tenzij daar een aantoonbare architectonische reden voor is.

De voorkeur is:

React
+
HTML Canvas
+
bestaande Artificer utilities
+
Zustand waar nodig

Dat geeft ons maximale controle over de integratie met CombatGrid.

24. DevKit integration

De huidige:

import { BattleMapEditor } from './BattleMapEditor';

in DevKit.tsx moet na refactor blijven werken.

Gebruik:

src/components/devkit/BattleMapEditor/index.ts

zodat:

import { BattleMapEditor } from './BattleMapEditor';

niet hoeft te veranderen.

De editor moet dus een drop-in replacement zijn voor de huidige prototypeversie.

25. UI design

De editor moet voelen als een echte developer/DM authoring tool.

Niet als een formulier.

Inspiratie:

Dungeon Scrawl: snel tekenen, compacte toolbar, layers, styles en canvas-first workflow.
Dungeon Map Builder: duidelijke scheiding tussen Tools, Elements, Layers, Grid, Generator en Assets.

Voor Artificer:

dark
dense
high information density
minimal rounded cards
clear active-tool states
strong canvas focus

De canvas moet het grootste deel van het scherm krijgen.

26. Belangrijk: editor ≠ runtime

Maak expliciet onderscheid tussen:

Authoring
BattleMapEditor

en:

Runtime
CombatGrid

De editor mag extra informatie bevatten die CombatGrid niet nodig heeft:

DM notes
hidden objects
secret doors
room labels
encounter markers
generator metadata
locked layers
editor-only decorations

CombatGrid krijgt alleen wat het runtime nodig heeft.

27. Migratie van huidige prototype

Behoud functionaliteit die al bestaat:

wall placement
door placement
rooms
enemies
entrance
exit
inspectables
attacker/target selection
cover calculation
map export
theme
scale

maar herimplementeer deze binnen het nieuwe architecturele model.

Niet simpelweg de bestaande code verplaatsen naar tien bestanden.

28. Fases

Voer dit gefaseerd uit.

Phase 1 — Architecture

Maak:

BattleMapEditor/
components/
hooks/
state/
types/
geometry/
rendering/
tools/
persistence/
commands/

Maak eerst de types en editor state.

Geen gigantische UI rewrite voordat het datamodel klopt.

Phase 2 — Canvas engine

Implement:

viewport
pan
zoom
coordinate conversion
grid
snapping
rendering pipeline
Phase 3 — Core tools

Implement:

select
wall
room
door
terrain
eraser
pan
Phase 4 — Objects

Implement:

asset browser
object placement
move
rotate
scale
delete
duplicate
locking
Phase 5 — Layers + Inspector

Implement:

layer management
visibility
lock
selection
inspector
Phase 6 — Undo/Redo

Command/history system.

Phase 7 — Runtime integration

Maak:

battleMapToCombatGrid()

en test met bestaande CombatGrid.

Phase 8 — Advanced DM functionality

Daarna:

fog of war
spawn points
encounter markers
labels
lighting
LoS
cover
generator
advanced exports
29. Testing

Voeg tests toe voor de belangrijkste pure functies:

coordinate conversion
grid snapping
wall geometry
door placement
LoS
cover
map serialization
map deserialization
map validation
resize
undo/redo

Daarnaast minimaal één Playwright-flow:

Open DevKit
→ Battle Map Editor
→ create map
→ draw wall
→ add door
→ add object
→ select object
→ move object
→ undo
→ redo
→ save/export
30. Quality gates

Na iedere fase:

npm run lint
npm run build
npm test

Als een bestaande test faalt, onderzoek waarom.

Geen any toevoegen om TypeScript-errors te omzeilen.

Geen:

as any

als architecturale workaround.

31. Eindresultaat

Het eindresultaat moet geen "mooier prototype" zijn.

Het moet een echte editor zijn waarmee een DM bijvoorbeeld dit kan doen:

New Map
    ↓
32 × 20 / 5ft
    ↓
Draw rooms
    ↓
Draw corridors
    ↓
Add walls
    ↓
Place doors
    ↓
Paint terrain
    ↓
Drag barrels / tables / torches
    ↓
Place secret door
    ↓
Place enemy spawn
    ↓
Place player entrance
    ↓
Add DM-only notes
    ↓
Configure fog
    ↓
Save BattleMap
    ↓
Load BattleMap in CombatGrid
    ↓
Run encounter

De editor moet uiteindelijk voelen als een volwaardige Artificer DM DevKit-tool, niet als een configuratiescherm.

Nog één belangrijke ontwerpkeuze van mij

Ik zou niet proberen Dungeon Scrawl 1-op-1 na te bouwen. Dat is niet nodig en zou ons op het verkeerde spoor zetten.

Dungeon Scrawl is vooral een algemene mapmaker. Artificer heeft een veel interessantere mogelijkheid: de map kan semantische game-data bevatten.

Dus bijvoorbeeld:

                    BATTLE MAP
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      Visual           Tactical         DM Data
        │                │                │
   textures          movement          encounters
   objects           LoS               secrets
   decoration        cover             triggers
   labels            doors             notes
                    │
                    ↓
               CombatGrid

Dat is wat ik als onderscheidend vermogen voor Artificer zou bouwen.

De huidige CombatGrid is daar eigenlijk al een goede basis voor: 32×20, 5 ft/cell, Canvas, walls, doors, LoS, pathfinding, fog en tokens bestaan al.

Kortom: eerst een solide map-authoring model, daarna de mooie editor-UI. Niet andersom. Dat voorkomt precies dat we over een paar weken weer tegen een tweede God Component aanlopen.