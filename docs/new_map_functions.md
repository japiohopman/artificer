# Herstructurering van de locatie- en submap-flow

Ik wil de flow rondom het betreden van een locatie opnieuw ontwerpen. Op dit moment werkt het functioneel, maar de logica zit te veel verspreid in `WorldMap.tsx`. Uiteindelijk wil ik de wereldkaart en de locatiekaarten meer van elkaar loskoppelen.

---

## 1. Enter Location flow

### Huidige situatie

Wanneer de speler op **Enter Location** drukt, gebeurt er nog weinig met de HUD.

### Gewenste flow

1. De speler kiest **Enter Location** in het chatvenster.
2. Het chatvenster klapt weer dicht.
3. De HUD schakelt automatisch over naar de **Location Map**.
4. De speler ziet nu de submap van de huidige locatie.

De overgang moet vloeiend aanvoelen, alsof de speler daadwerkelijk de stad of locatie binnenloopt.

---

## 2. Spawn- of entry-points

Wanneer een speler een locatie betreedt, wil ik niet dat de party willekeurig wordt geplaatst.

Elke locatie moet één of meerdere vaste entry points krijgen.

Bijvoorbeeld:

```text
public/assets/atlas/world/toril/faerun/cities/waterdeep/
    entry_points.json
```

Voorbeeld:

```json
[
  {
    "id": "south_gate",
    "x": 48,
    "y": 92,
    "direction": "south"
  },
  {
    "id": "harbor",
    "x": 8,
    "y": 55,
    "direction": "west"
  }
]
```

Bij het betreden van de locatie wordt de party automatisch op het juiste entry point geplaatst.

Hierdoor voelt iedere ingang van een stad of dungeon uniek aan.

we zouden hier in de devkit.tsx een location map eritor kunnen maken waar we de x en y man markers kunnen aanpassen en locaties kunnen toevoegen. 

---

## 3. Verantwoordelijkheden van de HUD

Momenteel worden onderdelen zoals:

* legenda;
* layer-buttons;
* locatie-informatie;

deels vanuit `worldMap.tsx` opgebouwd.

Dat voelt niet als de juiste plek.

Ik wil dat de complete HUD voor een Location Map wordt beheerd vanuit `WorldPanel.tsx` (of een aparte HUD-component specifiek voor locatiekaarten).

Dus:

* legenda;
* layer toggles;
* locatie-informatie;
* HUD-controls;

horen allemaal thuis in een React-component en niet in markdownbestanden.

---

## 4. Discoverable locaties

Niet iedere locatie moet direct zichtbaar zijn.

Ik wil een discovery-systeem introduceren.

Elke marker krijgt bijvoorbeeld een eigenschap:

```ts
discovered: true | false
```

of

```ts
visible: true | false
```

Bij een nieuw spel zijn bijvoorbeeld alleen zichtbaar:

* zeeën;
* grote regio's;
* grote steden zoals:

  * Waterdeep;
  * Baldur's Gate;
  * Neverwinter.

Alle overige locaties blijven verborgen totdat de speler ze ontdekt.

Een locatie kan worden ontdekt door:

* er naartoe te reizen;
* een NPC die de locatie noemt;
* een quest;
* het lezen van lore;
* een kaart of boek te vinden;
* een ander script-event.

Pas daarna verschijnt de marker op de kaart.

---

## 5. Performance

Dit systeem heeft ook een technisch voordeel.

Momenteel worden alle nodes en markers tegelijk gerenderd.

Met een discovery-systeem hoeven alleen zichtbare nodes te worden geladen en gerenderd.

Dat maakt de kaart schaalbaarder wanneer de wereld verder groeit.

Hetzelfde principe wil ik toepassen op:

* `WorldMap.tsx`;
* `LocationMap.tsx`;
* map-iconen;
* markers;
* labels.

---

## 6. Scheiding tussen WorldMap en LocationMap

Ik denk dat `WorldMap.tsx` momenteel te veel verantwoordelijkheden heeft.

Op dit moment bevat deze component onder andere:

* wereldkaart;
* reizen;
* locatiekaarten;
* markers;
* interacties;
* HUD-logica.

Ik denk dat het beter is om deze op te splitsen.

Bijvoorbeeld:

```text
WorldMap.tsx
├── WorldMapRenderer
├── WorldTravelController
├── WorldMarkers
├── DiscoveryMap

LocationMap.tsx
├── LocationRenderer
├── EntryPointSystem
├── LocationMarkers
├── NPCMarkers
├── BuildingMarkers
├── DiscoveryLocations
```

Hierdoor worden beide componenten overzichtelijker en krijgen ze ieder een duidelijke verantwoordelijkheid.

---

## 7. Einddoel

Mijn doel is om een systeem te creëren waarbij de wereldkaart en locatiekaarten twee afzonderlijke lagen vormen.

* **WorldMap** beheert reizen tussen regio's, steden en werelddelen.
* **LocationMap** beheert alles binnen een stad, dungeon of andere locatie.
* De HUD past zich automatisch aan afhankelijk van de actieve kaart.
* De speler betreedt een locatie via een vast entry point.
* Nieuwe locaties worden geleidelijk ontdekt in plaats van direct zichtbaar te zijn.
* Alleen zichtbare markers en nodes worden gerenderd, wat zowel de performance als de schaalbaarheid van de applicatie verbetert.
