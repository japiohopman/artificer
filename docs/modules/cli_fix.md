Project Walkthrough: Combat Reorganization & Leveling Port
In deze sessie hebben we met succes alle drie de geplande fasen afgerond zonder bestaande JSON-structuren te vernietigen of ongeplande data ports uit te voeren.

Fase 1: Combat Architectuur Reorganisatie
We hebben de combat componenten netjes verplaatst naar hun eigen dedicated folder om overzicht te creëren.

Map src/components/combat/ aangemaakt.
CombatGrid.tsx, Token.tsx, en TokenActionHUD.tsx verplaatst vanuit de generieke hud map.
combatUtils.ts verplaatst vanuit src/lib/.
De relatieve imports in de hele applicatie gecorrigeerd en geverifieerd via TypeScript.
Fase 2: Performance Optimalisatie
Om onnodige re-renders en Framer Motion bottlenecks te voorkomen, hebben we het volgende geoptimaliseerd:

Zustand Selectors: Componenten zoals App.tsx en CombatGrid.tsx destructureerden de hele store (bv. const { combatState } = useGameStore()). Dit is omgezet naar specifieke callbacks (const combatState = useGameStore(state => state.combatState)) zodat React alleen reageert op échte wijzigingen.
Strippen van Framer Motion uit list loops: In zware componenten zoals Inventory.tsx is de <motion.div> omgezet naar een reguliere <div> met animate-in fade-in Tailwind CSS classes, en is de verplichte layout-thrashing door <AnimatePresence mode="popLayout"> verwijderd. <Token.tsx> behield zijn motion component omdat dit essentieel is voor combat grid verplaatsing en animaties, wat over hardware-versnelde transforms loopt.
Fase 3: Leveling & Atlas Integratie
We hebben de foundry_porting_leveling.md en de hardcoded waarden in characterUtils.ts aangepakt:

Geconstateerd dat de atlasService.ts al over methoden beschikte om de public JSON-bestanden in te laden (voor classes, species, etc.), wat de user wens om de yaml-to-json scripts over te slaan respecteerde.
De logica in processLevelUp() (in characterUtils.ts) geüpdatet. Waar deze vroeger de statische en hardcoded map CLASS_DATA gebruikte voor HP increments en features, wordt er nu via atlasService.loadClass() naar dynamische data gekeken.
Features en ASI triggers (hasASI) worden nu ook dynamisch opgehaald middels atlasService.loadLevelData().
Als ability_score_bonuses netjes in de data staat geconfigureerd, pakt de app dit op in plaats van strikt mod 4 level loops te draaien.
De combat engine werkt nu los, de app presteert soepeler en de leveling features zijn flexibel gekoppeld aan jullie rijke JSON directory. Je kunt dit alles na een frisse start nu zelf grondig uittesten!