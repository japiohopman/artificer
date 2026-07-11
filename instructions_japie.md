# Hallo Japie! 🐉

Het witte scherm dat je kreeg bij het opstarten, werd veroorzaakt door import- en cache-problemen in de browser en de lokale Vite-ontwikkelserver. We hebben alle overgebleven alias-importpaden in de code omgezet naar standaard relatieve paden (zodat ze altijd 100% correct laden op elke computer) en we hebben hieronder een eenvoudig stappenplan voor je opgesteld om je lokale omgeving helemaal op te schonen en weer vliegensvlug up-and-running te krijgen!

---

### Wat ging er mis? 🤔
Vite (de tool die de code omzet naar een werkende website op je computer) cachet bestanden heel agressief om snel te kunnen laden. Wanneer er bestanden van naam veranderen of import-paden (zoals de iconen) worden aangepast, kan Vite soms in de war raken en een oude versie serveren. Hierdoor kon de browser bepaalde functies (zoals `getEnemyArtworkUrl` of de atlas-iconen) niet vinden, wat resulteerde in een leeg wit scherm.

---

### Stappenplan om de app weer op te starten 🚀

Volg deze eenvoudige stappen op je computer om alles fris te herstarten:

#### Stap 1: Haal de nieuwste wijzigingen op
Zorg dat je de nieuwste code van de Git-branch binnenhaalt zodat onze fixes actief zijn.

#### Stap 2: Schoon de Vite-cache op en start de server
We gaan de ontwikkelserver starten en dwingen om alle gecachte bestanden weg te gooien en opnieuw op te bouwen. 
Open je terminal in de root-map van het project en voer het volgende uit:
```bash
npm run dev -- --force
```
*(De `-- --force` parameter zorgt ervoor dat de Vite-dependency-cache volledig wordt leeggemaakt en opnieuw gegenereerd!)*

#### Stap 3: Wis je browser-cache (Heel belangrijk!)
Zelfs als de server nu goed draait, kan je browser nog een oude versie van de website onthouden. Doe het volgende:
1. Open de game in je browser (meestal op `http://localhost:3000`).
2. Druk op **F12** (of `Ctrl+Shift+I` / `Cmd+Opt+I` op Mac) om de Ontwikkelaarshulpprogramma's te openen.
3. **Klik met de rechtermuisknop** op de vernieuwknop (het herlaad-icoontje linksboven in je browser).
4. Kies de optie: **"Cache leegmaken en hard herstarten"** (Empty Cache and Hard Reload / Cache wissen en hard herladen).
5. Als alternatief kun je de website openen in een **Incognito/Privévenster** om te testen.

---

Veel plezier met spelen en ontwikkelen! Mocht er toch nog iets haperen, laat het gerust weten! ⚔️
