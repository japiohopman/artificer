 Thought for 29s
   Onderzoeksrapport & Implementatieplan: Issue #418

  │ Governing Issue: #418 https://github.com/japiohopman/artificer/issues/418 — fix(combat): restore edge-aware
  │ hostile monster turns and attacks
  │ Specialist Contract: Gameplay Specialist (.github/agents/gameplay-specialist.agent.md)
  │ Modus: Planning Only (--mode=plan) — Read-Only
  │ Target Branch: fix/418-edge-aware-monster-turns
  ──────
  1. Bevestigde oorzaken versus hypothesen voor het uitblijven van vijandelijke aanvallen

  Na een grondige audit van de runtime-lifecycle in src/store/useGameStore.ts, src/components/combat/combatUtils.ts
  en de canonieke Atlas-data van monsters (o.a. Goblin en Orc), zijn de concrete oorzaken vastgesteld:

  Bevestigde oorzaken:

  1. Oorzaak 1 (Geometrie): checkLoS ontbeert combatState.walls
      • In useGameStore.ts (regel 654) wordt aangeroepen:
        const hasLoS = checkLoS(updatedMonster, targetPos, currentCombatState.grid);

      • De signatuur in combatUtils.ts is checkLoS(start, end, grid, walls?: any[]).
      • Doordat walls niet wordt meegegeven, valt checkLoS terug op cell-based checks (grid[y][x].type === 'wall' |
      'door'). Sinds BattleMap v2 (#369) zijn deuren en muren canonieke rand-spines (combatState.walls) en worden
      cellen niet meer overschreven met cell.type = 'door'. Zichtlijnen 'zien' hierdoor geen enkele randdeur of
      randmuur.
  2. Oorzaak 2 (Geometrie): findPath ontbeert argumenten 6 (creatureSize) en 7 (walls)
      • In useGameStore.ts (regel 717 en 748) wordt aangeroepen:
        findPath(updatedMonster, targetPos, currentCombatState.grid, currentCombatState.monsters,
        currentCombatState.pcPositions || playerPos);

      • De signatuur in combatUtils.ts (regel 118) is:
        findPath(start, end, grid, monsters, pcPositions, creatureSize = 'Medium', walls?)

      • Argument 6 en 7 ontbreken volledig. Hierdoor is walls altijd undefined. Monsters routeren daardoor dwars door
      dichte deuren en muren heen, of breken af bij obstakels.
  3. Oorzaak 3 (AI State Machine): De "Awareness Gate" blokkeert vijanden die niet direct in een 90°-kegel staan
      • Monsters worden aangemaakt met awareness: 'idle'.
      • In startCombat() wordt het initiatief gerold, maar de awareness van vijanden blijft 'idle'.
      • In executeMonsterTurn:
        if (updatedMonster.awareness !== 'combat') {
          const hasLoS = checkLoS(updatedMonster, targetPos, currentCombatState.grid);
          const inCone = isInViewCone(updatedMonster, targetPos);
          ...
        }

      • isInViewCone controleert een strikte 90°-kwadrantkegel op basis van viewDirection (0:N, 1:E, 2:S, 3:W).
      • Als een monster niet toevallig in de richting van de speler kijkt én de speler verder dan 3 tegels weg staat:
          • updatedMonster.awareness blijft 'idle'.
          • De flow springt naar regel 760:
            } else {
              // Idle patrol (very simple: rotate)
              updatedMonster.viewDirection = (updatedMonster.viewDirection + 1) % 4;
              stateChanged = true;
            }

          • Gevolg: Het monster doet niets anders dan 90° draaien op zijn beurt. Er vindt geen beweging en geen
          aanval plaats.

  4. Oorzaak 4 (Actieselectie): Niet-aanvallende traits (bv. "Nimble Escape", "Aggressive") worden geselecteerd als
  'aanval'
      • In useGameStore.ts (regels 676–689) doorloopt een loop alle monsterActions.
      • Voor een Goblin is actie 0 "nimble escape" (damage: []). Omdat het woord 'ranged' of 'bow' niet in de
      beschrijving staat, stelt de code range = 1.5. Bij een speler binnen 1.5 vakjes kiest de code "nimble escape"
      als de primaire aanval in plaats van "scimitar".
      • Voor een Orc is actie 0 "aggressive" (damage: []), die eveneens als aanval wordt gekozen.
      • Doordat act.damage een lege array [] is, valt resolveCombatAction terug op verzonnen defaults (1d6 slashing).
  5. Oorzaak 5 (Validatie): Aanvallen zonder Line-of-Sight check
      • Als een vijand wél awareness === 'combat' heeft en binnen aanvalsbereik staat (bv. 1 tegel afstand voor melee,
      of 12 tegels voor boog), controleert de code vóór resolveCombatAction niet of er een dichte deur of muur tussen
      staat. Zonder LoS-check kan een boogschutter door massieve stenen muren schieten.


  Hypothese (Uitgesloten):

  • Hypothese: resolveCombatAction of het 3D-dobbelsteensysteem blokkeert de afhandeling.
  Bevinding: Uitgesloten. resolveCombatAction werkt naar behoren zodra het wordt aangeroepen. Het probleem is dat de
  aanroep nooit bereikt wordt of met ongeldige data wordt gevoed.
  ──────
  2. De exacte aanroepketen en beïnvloede functies

    [Encounter Start]
    useGameStore.startCombat()
       └─ Rolt initiatief voor party + monsters.
       └─ Indien eerste actor hostile monster is: roept direct executeMonsterTurn(firstActor.id) aan.
            │
    [Turn Advancement]
    useGameStore.nextTurn()
       └─ Bepaalt nextActor via activeTurnIndex.
       └─ Identificeert hostile monster: !nextActor.isPlayer && (!nextMonster || !nextMonster.isAlly).
       └─ Roept executeMonsterTurn(nextActor.id) aan.
            │
    [Hostile Turn Lifecycle]
    useGameStore.executeMonsterTurn(monsterId)
       ├─ Zoekt target: actief party-lid met minimale Chebyshev-afstand (targetPos).
       ├─ 1. Awareness Check:
       │     ├─ checkLoS(updatedMonster, targetPos, grid) ⚠️ [Mist walls]
       │     └─ isInViewCone(updatedMonster, targetPos) ⚠️ [Blokkeert actie als speler buiten 90° kegel staat]
       ├─ 2. Actieselectie:
       │     └─ Itereert over monsterActions ⚠️ [Filtert niet op daadwerkelijke aanvallen met damage/attack_bonus]
       │     └─ Verzonnen fallback (Claw/Bite, Longbow, Fire Bolt met 1d6+2) ⚠️ [Schendt Atlas-integriteit]
       ├─ 3. Beweging & Pathfinding:
       │     └─ findPath(updatedMonster, targetPos, grid, monsters, pcPositions) ⚠️ [Mist creatureSize en walls]
       │     └─ Beweegt maximaal monsterSpeed stappen richting doel.
       ├─ 4. Aanvalsuitvoering:
       │     └─ if (dist <= attackRange) ⚠️ [Mist LoS-verificatie met walls]
       │     └─ resolveCombatAction(updatedMonster, target, attackAction)
       └─ 5. Einde beurt:
             └─ setTimeout(() => get().nextTurn(), 1000) ⚠️ [Risico op dubbele advancement bij actieve timers]
  ──────
  3. Heeft #369 een regressie veroorzaakt of een ouder probleem blootgelegd?

  Beide:

  1. Regressie door #369:
  Vóór #369 werden deuren en sommige muren direct als cellen (cell.type = 'door' | 'wall') op het grid gestempeld.
  Functies zoals checkLoS en findPath zagen daardoor via de cell-fallback nog enige obstructie. In #369 zijn deuren
  en muren conform de canonieke BattleMap v2 architectuur gemigreerd naar boundary edges (combatState.walls) en
  worden vloeren niet meer overschreven. Omdat executeMonsterTurn niet werd geüpdatet om combatState.walls mee te
  sturen, verloren monsters per direct alle geometrische obstakel-detectie.
  2. Ouder blootgelegd probleem:
  De 'awareness gate' (waarbij monsters in actieve combat rondjes draaien in plaats van bewegen/aanvallen als ze niet
  in de 90°-kegel kijken), het selecteren van niet-aanvallende traits (nimble escape, aggressive), en de verzonnen
  fallback-statistieken waren al aanwezig in de monster-AI en zijn nu aan het licht gekomen.
  ──────
  4. Gefaseerd implementatieplan

  Fase 1: Edge-Aware Geometrie in de AI Lifecycle

  • Bestand: src/store/useGameStore.ts
  • Wijzigingen:
      • In executeMonsterTurn:
          • Geef currentCombatState.walls door aan checkLoS(updatedMonster, targetPos, currentCombatState.grid,
          currentCombatState.walls).
          • Geef updatedMonster.size || 'Medium' én currentCombatState.walls door aan findPath:
            findPath(
              updatedMonster,
              targetPos,
              currentCombatState.grid,
              currentCombatState.monsters,
              currentCombatState.pcPositions || playerPos,
              updatedMonster.size || 'Medium',
              currentCombatState.walls
            );




  Fase 2: Betrouwbare Awareness in Gevechtssessies

  • Bestand: src/store/useGameStore.ts
  • Wijzigingen:
      • Zodra startCombat() wordt aangeroepen of een monster actief in de beurtvolgorde van een lopend gevecht aan de
      beurt is:
          • Hostile monsters die deelnemen aan een gevecht moeten in awareness: 'combat' staan (of direct hun doelwit
          engageren mits LoS/pathfinding bestaat), in plaats van vast te lopen in een idle patrol-rotatie.
          • Bij executeMonsterTurn: als een monster in een actief gevecht zit, zoekt het de dichtstbijzijnde geldige
          PC op basis van pathfinding/LoS.



  Fase 3: Canonieke Atlas-actieselectie zonder verzonnen statistieken

  • Bestand: src/store/useGameStore.ts
  • Wijzigingen:
      • Filter monsterActions strikt op daadwerkelijke aanvallen: acties met Array.isArray(act.damage) && act.damage.
      length > 0 of een gedefinieerde aanvalsbonus/aanvalsmechaniek.
      • Sorteer/kies de meest geschikte aanval op basis van afstand:
          • Melee: range <= 1.5 (bv. Scimitar, Greataxe).
          • Ranged: range <= 12 (bv. Shortbow, Javelin), mits er LoS is.
      • Verwijder de verzonnen fallbacks (Longbow, Fire Bolt, Claw/Bite met 1d6+2 piercing). Als een entiteit geen
      aanvalsacties heeft in Atlas, voert deze geen verzonnen aanval uit.


  Fase 4: Aanvalsvalidatie met Line-of-Sight & Dekking

  • Bestand: src/store/useGameStore.ts
  • Wijzigingen:
      • Vóór het aanroepen van resolveCombatAction controleren dat:
          1. De afstand kleiner of gelijk is aan het bereik van de geselecteerde aanval (dist <= attackRange).
          2. Er een ongehinderde zichtlijn is (checkLoS(updatedMonster, targetPos, currentCombatState.grid,
          currentCombatState.walls)).
      • Als een vijand binnen bereik staat maar gescheiden is door een dichte deur of muur, mag er niet door de muur
      aangevallen worden.


  Fase 5: Asynchrone Timing en Turn Advancement Veiligheid

  • Bestand: src/store/useGameStore.ts
  • Wijzigingen:
      • Voorkom race conditions bij timeouts:
          • Controleer in de timeout-callbacks of het gevecht nog steeds actief is (combatState.initiativeOrder.
          length > 0), of het monster nog leeft (freshMonster.hp > 0) en of de actieve beurtindex nog steeds
          overeenkomt met de huidige actor.
          • Voorkom dubbele nextTurn()-aanroepen wanneer een monster tussentijds sterft of de speler handmatig op
          'End Turn' klikt.


  ──────
  5. Gerichte regressietests (tests/hostile_turn_combat.test.ts)

  Een nieuw testbestand toevoegen met gerichte tests:

  1. Canonieke Atlas-aanvalselectie:
  Bewijs dat een Goblin met nimble escape, scimitar en shortbow in melee-bereik de scimitar kiest (met de
  bijbehorende canonieke slashing damage uit Atlas) en op afstand de shortbow, en nooit nimble escape als aanval
  kiest.
  2. Geen verzonnen statistieken:
  Bewijs dat een monster zonder aanvalsacties geen verzonnen 1d6+2 aanval uitvoert.
  3. Muur- en deurbarrière in pathfinding:
  Bewijs dat findPath met combatState.walls een route plant om een gesloten muurgrens heen, en niet dwars door de
  muur loopt.
  4. LoS-blokkering bij aanvallen:
  Bewijs dat een monster gescheiden van de speler door een gesloten muur of dichte deur resolveCombatAction niet
  aanroept, zelfs als de Chebyshev-afstand 1 tegel is.
  5. Turn-doorloop en levenscyclus:
  Bewijs dat een in-range vijand met een geldige aanval resolveCombatAction bereikt en de beurt ordentelijk doorgeeft
  aan de volgende actor.
  ──────
  6. Risico's en mitigaties

   Risico            │ Impact                                     │ Mitigatie
  ───────────────────┼────────────────────────────────────────────┼──────────────────────────────────────────────────
   Ghost Turn bij    │ Een monster dat tijdens de 1000ms timeout  │ Check freshMonster && freshMonster.hp > 0 direct
   verslagen monster │ wordt verslagen, voert alsnog een aanval   │ binnen de timeout alvorens acties uit te voeren.
                     │ uit.                                       │
   Dubbele Turn      │ Als nextTurn() handmatig wordt getriggerd  │ Valideer dat state.combatState.activeTurnIndex
   Advancement       │ terwijl de timeout loopt, slaat het        │ nog steeds matcht met de actor ID voordat
                     │ gevecht een beurt over.                    │ nextTurn() wordt aangeroepen.
   Targeting van     │ Monsters blijven aanvallen op personages   │ Behoud en versterk het filter dat alleen actieve
   bewusteloze PCs   │ met 0 HP.                                  │ party-leden met hp > 0 target.
   Oneindige loop    │ Monster kan de speler niet bereiken en     │ Als findPath null retourneert (volledig
   bij onbereikbaar  │ blijft hangen.                             │ ingesloten), beweegt het monster niet en
   doelwit           │                                            │ beëindigt het direct zijn beurt via nextTurn().
  ──────
  7. Verificatieopdrachten

  Conform package.json uit te voeren na implementatie:

  • bun test tests/hostile_turn_combat.test.ts
  • bun test tests/combat_integration.test.ts
  • bun test tests/battle_map_v2_schema.test.ts
  • npm run test:workflow
  • npm run lint
  • git diff --check
  ──────
  8. Documentatie-updates

  Na goedkeuring en implementatie:

  • docs/systems/TACTICAL_COMBAT_ENGINE.md: Paragraaf AI Combat updaten met de randbewuste geometrie (combatState.
  walls), canonieke Atlas-actieselectie en beurtcyclus-contracten.
  • docs/ARCHITECTURE_STATUS.md: Status van Issue #418 documenteren.
  ──────
  Dit plan is puur onderzoek en planning (--mode=plan). Er zijn geen bestanden gewijzigd. Ik wacht op je review en
  akkoord alvorens over te gaan naar implementatie.

────────────────────────────────────────────────────────────
> Revise your Issue #418 implementation plan before any implementation.
  Planning only. Do not edit files.

  The initial investigation is accepted, but tighten these points:

  1. Combat awareness:
  - A hostile monster participating in the active initiative order must not waste its turn merely because the target is
  outside its 90-degree view cone.
  - Do not introduce wall-penetrating vision or attacks.
  - Preserve canonical wall and closed-door obstruction for line of sight and attacks.
  - Explain exactly how awareness should behave during an active encounter.
  - Do not introduce a new stealth or surprise system.

  2. Canonical Atlas attacks:
  - Inspect the actual Atlas action schema and representative Goblin and Orc data.
  - Identify exactly which fields establish that an action is a valid attack.
  - Nimble Escape, Aggressive, and other non-attack traits must never be selected as attacks.
  - Do not assume attack_bonus alone makes an action a valid attack.
  - Do not invent damage, attack bonuses, spells, or fallback actions.
  - Determine attack range from canonical Atlas data and documented conversions.
  - Do not introduce generic hardcoded melee/ranged ranges such as 1.5 or 12 tiles unless those values are explicitly
  supported by the canonical data or an existing documented rules contract.
  - If a monster has no valid attack, it must not fabricate one.

  3. Turn lifecycle:
  - Keep timeout and advancement safeguards minimal and local to executeMonsterTurn.
  - Ensure an actor cannot advance the same turn twice.
  - Ensure a dead monster or ended encounter cannot execute a stale scheduled turn.
  - Avoid introducing a general timer framework.

  4. Tests:
  - Use real canonical Atlas monster data where practical.
  - Prove a Goblin selects Scimitar in melee and Shortbow at valid ranged distance, based on actual stored attack data.
  - Prove non-attack traits are rejected.
  - Prove missing attack data never produces invented damage.
  - Prove walls and closed doors block movement and ranged attacks.
  - Prove an in-range valid hostile attack reaches resolveCombatAction.
  - Prove one hostile turn advances exactly once.

  5. Scope:
  - Keep the two findPath call sites and checkLoS wall propagation in scope.
  - No BattleMap Editor changes.
  - No full action-economy redesign.
  - No Issue #371 implementation.
  - No unrelated combat or Atlas refactoring.

  Return the revised plan, exact files, confirmed Atlas field semantics, test strategy, and any remaining
  uncertainties.

  Planning only. Wait for review.

○ Thought for 23.9s (Initial hypothesis: ranged attacks are determined by weapon properties. Examining how the appl...)
● Ran (git grep -n "range" src/components/combat/)
● Explored 1 file (TokenActionHUD.tsx)
● Ran 5 commands (Get-ChildItem -Path ... ×3 · Get-Content public\a... ×2) (ctrl+o to expand)

▸ Thought for 28s
   Herzien Onderzoeks- & Implementatieplan: Issue #418

  │ Governing Issue: #418 https://github.com/japiohopman/artificer/issues/418 — fix(combat): restore edge-aware
  │ hostile monster turns and attacks
  │ Specialist Contract: Gameplay Specialist (.github/agents/gameplay-specialist.agent.md)
  │ Modus: Planning Only (--mode=plan) — Geen bestandswijzigingen
  │ Target Branch: fix/418-edge-aware-monster-turns
  ──────
  1. Combat Awareness in Actieve Gevechten

  Gedrag tijdens een actief gevecht

  • Geen beurtverlies door 90°-zichtkegel:
  Zodra een gevecht actief is (startCombat is uitgevoerd en het initiatief loopt), bevinden alle deelnemende vijanden
  zich in actieve gevechtstoestand (awareness: 'combat'). Ze verspillen hun beurt niet langer aan een nutteloze 'idle
  patrol rotation' van 90° enkel omdat de speler zich niet toevallig in hun initiële kijkkwadrant bevindt.
  • Volledige obstructie door muren en gesloten deuren:
  Combat awareness geeft nooit röntgenzicht door muren. Zowel zichtlijnen als aanvallen worden strikt geblokkeerd
  door canonieke randen (combatState.walls).
      • checkLoS(monster, targetPos, grid, walls) bepaalt of er ongehinderd zicht is tussen het monster en het
      doelwit.
      • Een gesloten deur (doorState !== 'open') of muur (type === 'wall') blokkeert de zichtlijn volledig.
      • Als er geen directe zichtlijn is (doelwit bevindt zich achter een muur of gesloten deur), ziet het monster
      het doelwit niet en kan het niet aanvallen.
      • Het monster gebruikt findPath met combatState.walls om een fysiek geldige route om de muur heen of door open
      deuren te bepalen richting de spelerpositie. Als er geen geldige route bestaat (speler zit achter dichte deuren
      zonder doorgang), kan het monster niet dichterbij komen en beëindigt het ordentelijk zijn beurt.
  • Geen nieuw stealth- of surprise-systeem:
  We introduceren geen nieuw stealth- of verrassingssysteem; we herstellen louter het correcte gedrag dat vijanden in
  de beurtvolgorde hun beurt daadwerkelijk uitvoeren met respect voor de fysieke map-geometrie.
  ──────
  2. Canonieke Atlas-aanvallen en Bereikbepaling

  A. Identificatie van geldige aanvallen in het Atlas-schema

  Uit inspectie van tjwqogi3a4ual7lc.json (Goblin), hb49mcovbxwwekwq.json (Orc) en 8px2jhwuptnnrbvx.json (Gibbering
  Mouther) blijkt het exacte schema:

  • Eigenschappen van acties: name, desc, attack_bonus, damage, actions.
  • Waarom attack_bonus alleen onvoldoende is:
  Niet-aanvallende traits bevatten in Atlas vaak óók een numerieke attack_bonus (bijv. Goblin Nimble Escape heeft
  attack_bonus: 2, Gibbering Mouther Aberrant Ground heeft attack_bonus: -2, Orc Aggressive heeft attack_bonus: 0).
  • Het doorslaggevende veld:
  Een actie is uitsluitend een geldige aanval als:
    Array.isArray(action.damage) &&
    action.damage.length > 0 &&
    Boolean(action.damage[0]?.damage_dice)

  • Afwijzing van niet-aanvallende traits:
  Acties zoals Nimble Escape, Aggressive, Multiattack, Aberrant Ground hebben damage: []. Deze worden per definitie
  uitgesloten van aanvalsselectie.

  B. Geen verzonnen schade of fallback-aanvallen

  • De bestaande verzonnen defaults (name: 'Longbow' | 'Fire Bolt' | 'Claw/Bite', attack_bonus: 4, damage_dice: '1d6+
  2') worden volledig verwijderd.
  • Indien een monster geen acties met geldige schadedata bezit, selecteert het null en fabriceert het geen aanval.

  C. Bereikbepaling vanuit canonieke data en gedocumenteerde grid-conversie

  Conform docs/systems/TACTICAL_COMBAT_ENGINE.md geldt: 1 rastercel = 5 voet (Chebyshev-afstand: aangrenzend = 1 cel
  = 5 ft reach).

  • Melee-aanvallen:
  Standaard bereik is 1 cel (5 ft). Indien de actiebeschrijving expliciet een groter bereik vermeldt (bijv. reach 10
  ft.), is het bereik reach/5 (2 cellen).
  • Ranged-aanvallen:
  Een aanval is ranged als de naam of beschrijving overeenkomt met een canoniek afstandswapen (zoals shortbow,
  longbow, javelin, crossbow, dart, sling) of expliciet range X/Y ft. bevat:
      • Shortbow: normale dracht 80 ft → ⌊80/5⌋ = 16 cellen.
      • Javelin: normale dracht 30 ft → ⌊30/5⌋ = 6 cellen.
      • Longbow: normale dracht 150 ft → ⌊150/5⌋ = 30 cellen.
      • Indien een getal in de beschrijving staat (bijv. range 30 ft. of range 30/120 ft.): normale dracht in voet
      gedeeld door 5.
  • Selectielogica op basis van afstand:
      • Monster kiest de meest effectieve aanval die past bij de huidige afstand tot het doelwit:
          • Staat het monster aangrenzend (dist <= 1) en heeft het een melee-aanval (bijv. Scimitar of Greataxe), dan
          kiest het die aanval.
          • Staat het monster op afstand (dist > 1) en heeft het een afstandswapen (bijv. Shortbow of Javelin) met
          dist <= weaponRange én ongehinderde LoS, dan selecteert het die afstandsaanval.


  ──────
  3. Beurt-levenscyclus en Minimale Asynchrone Beveiliging

  Om timingproblemen te voorkomen zonder een zwaar generiek timer-framework te bouwen, houden we alle bewaking lokaal
  binnen executeMonsterTurn:

  1. Beurt-identificatie:
  Bij het aanroepen van executeMonsterTurn(monsterId) leggen we de context vast:
  const turnActorId = monsterId;
  const turnIndex = get().combatState.activeTurnIndex;
  2. Gegarandeerd eenmalige beurt-doorgifte (advanceTurnOnce):
  Een lokale sentinel voorkomt dat dezelfde beurt twee keer kan worden doorgegeven:
    let turnAdvanced = false;
    const advanceTurnOnce = () => {
      if (turnAdvanced) return;
      turnAdvanced = true;
      get().nextTurn();
    };

  3. Validatie bij timer-afloop:
  Vóór het uitvoeren van verplaatsing of aanval binnen de setTimeout:
      • Controleer of het gevecht nog actief is (state.combatState.initiativeOrder.length > 0 en actieve gameMode).
      • Controleer of de actieve beurtindex nog steeds overeenkomt met deze actor (state.combatState.activeTurnIndex
      === turnIndex en actor ID klopt).
      • Controleer of het monster nog bestaat en in leven is (freshMonster && freshMonster.hp > 0). Indien verslagen:
      roep direct advanceTurnOnce() aan en stop.
  4. LoS-verificatie vóór de klap:
  resolveCombatAction wordt pas aangeroepen nadat expliciet is geverifieerd dat checkLoS(updatedMonster, targetPos,
  currentCombatState.grid, currentCombatState.walls) waar is.
  ──────
  4. Teststrategie (tests/hostile_turn_combat.test.ts)

  We maken een gerichte testsuite die de canonieke Atlas-bestanden direct inlaadt:

  1. Goblin Atlas-aanvalselectie (Melee vs Ranged):
      • Met echte data uit public/assets/atlas/enemies/json/14/humanoid/tjwqogi3a4ual7lc.json:
          • Op afstand 1 cel selecteert de Goblin scimitar (1d6-1 slashing, bereik 1) en verwerpt nimble escape.
          • Op afstand 5 cellen selecteert de Goblin shortbow (1d6-1 piercing, bereik 16) en verwerpt nimble escape.

  2. Orc Atlas-aanvalselectie:
      • Met echte data uit public/assets/atlas/enemies/json/14/humanoid/hb49mcovbxwwekwq.json:
          • Verwerpt aggressive (damage: []).
          • Kiest greataxe op 1 cel afstand (1d12+3 slashing).
          • Kiest javelin op afstand (1d6+3 piercing, bereik 6).

  3. Uitsluiting van verzonnen schade:
      • Een monster zonder schadewaarden in zijn acties (lege array actions: [] of acties met damage: []) resulteert
      in null en voert geen aanval uit (geen verzonnen 1d6+2).
  4. Muren en gesloten deuren blokkeren zicht en schoten:
      • Een vijand en speler op afstand 1 of 5 cellen, gescheiden door een randmuur of dichte deur:
          • checkLoS(monster, player, grid, walls) retourneert false.
          • De vijand valt niet aan door de muur/deur.
          • findPath(monster, player, grid, monsters, pcPositions, size, walls) leidt het monster langs de muur naar
          de opening.

  5. Aanvalsuitvoering bereikt resolveCombatAction:
      • Een in-range vijand met zichtlijn en een canonieke aanval roept resolveCombatAction succesvol aan.
  6. Beurt-doorgifte:
      • Een hostile turn advanceert exact één keer naar de volgende index in de initiativeOrder.
      • Een verslagen vijand tijdens de beurt voert geen aanval meer uit en triggert geen dubbele advancement.

  ──────
  5. Bepaling van Scope en Exacte Bestanden

  Bestanden die worden aangepast:

  1. src/store/useGameStore.ts:
      • startCombat: zet actieve vijanden in awareness: 'combat'.
      • executeMonsterTurn:
          • Beide findPath call-sites voorzien van creatureSize en currentCombatState.walls.
          • checkLoS voorzien van currentCombatState.walls.
          • Canonieke actiefiltering (act.damage.length > 0) en bereikberekening.
          • Verwijderen van verzonnen fallbacks (Longbow/Fire Bolt/Claw/Bite).
          • LoS-check vóór het afvuren/slaan in resolveCombatAction.
          • Lokale safeguards tegen dubbele beurt-advancement en stale timers.

  2. tests/hostile_turn_combat.test.ts (nieuw):
      • De gerichte testsuite zoals hierboven beschreven.
  3. docs/systems/TACTICAL_COMBAT_ENGINE.md:
      • Documenteren van de randbewuste AI-lifecycle en canonieke Atlas-actieselectie.
  4. docs/ARCHITECTURE_STATUS.md:
      • Statusupdate voor Issue #418.


  Buiten Scope:

  • Geen wijzigingen aan de BattleMap Editor.
  • Geen herontwerp van de algehele actie-economie (acties/bonusacties/reacties blijven zoals ze zijn).
  • Geen implementatie van Issue #371 (conditiesysteem).
  • Geen wijzigingen aan Atlas JSON-bestanden.
  ──────
  6. Verificatie-opdrachten

  1. bun test tests/hostile_turn_combat.test.ts
  2. bun test tests/combat_integration.test.ts
  3. bun test tests/battle_map_v2_schema.test.ts
  4. npm run test:workflow
  5. npm run lint
  6. git diff --check
  ──────
  Dit herziene plan is volledig opgesteld in planning-modus (--mode=plan). Er zijn geen bestanden gewijzigd. Ik wacht
  op je akkoord om over te gaan naar de implementatie.

────────────────────────────────────────────────────────────
> Final planning corrections for Issue #418. Planning only; no edits.

  1. Weapon range source:
  The monster action descriptions in the actual Goblin and Orc Atlas JSON
  are template placeholders:
  "[[/attack extended]]. [[/damage extended]]."

  Do not parse these descriptions for range.

  Use the existing canonical Atlas equipment JSON instead:
  - public/assets/atlas/equipment/json/{ruleset}/weapon/{weapon-index}.json

  Relevant metadata includes:
  - weapon_range
  - range.normal
  - range.long
  - properties (including thrown and reach)

  Resolve the monster action name to its matching canonical equipment
  record using the existing Atlas loading/data-access conventions.

  Use range.normal / 5 for the normal attack range in grid cells.
  Do not use long range until the combat resolver supports its rules,
  including disadvantage.

  For thrown weapons such as Javelin, respect the canonical thrown
  property and range metadata even when weapon_range is "Melee".

  Keep attack_bonus and damage sourced from the monster action itself.
  Do not replace monster damage with generic equipment damage.
  If weapon metadata cannot be resolved, do not invent a range.

  Update the Goblin and Orc tests to load both their real monster action
  data and the corresponding real equipment metadata.

  2. Pathfinding creature size:
  The current findPath signature accepts only 'Medium' | 'Large'.
  Normalize Small to Medium for this existing footprint implementation,
  or propose a minimal justified type extension if required.
  Do not pass unsupported sizes blindly.

  3. Turn advancement:
  The actor/turn-index/encounter validation must happen immediately
  before every actual nextTurn call, including after awaited
  resolveCombatAction and inside delayed callbacks.

  advanceTurnOnce must not advance a stale turn merely because its
  local boolean sentinel has not yet been set.
  A manually advanced turn, ended encounter, or removed/dead actor
  must invalidate the pending callback.

  4. Active combat and obstructed targets:
  Clarify the intended distinction:
  - Active encounter state may use the active party member's position
    for pathfinding around an obstruction.
  - It must not grant line of sight through walls or closed doors.
  - An attack is only permitted after a fresh canonical LoS check.

  Keep the implementation within Issue #418 scope.

  Return the final revised plan and exact file list.
  Do not implement yet.

○ Thought for 8.0s (The initial parsing incorrectly extracted weapon range from monster action descriptions; these...)
● Ran 2 commands (git grep -n "weapon" src/store/useAtlasStore.ts: failed · git grep -n "equipment" src/services/ s...)
● Explored 2 files (storageService.ts, storageService.ts) (ctrl+o to expand)

▸ Thought for 18s

   Definitief Herzien Implementatieplan: Issue #418

  │ Governing Issue: #418 https://github.com/japiohopman/artificer/issues/418 — fix(combat): restore edge-aware
  │ hostile monster turns and attacks
  │ Specialist: Gameplay Specialist (.github/agents/gameplay-specialist.agent.md)
  │ Modus: Planning Only (--mode=plan) — Geen bestandswijzigingen
  │ Target Branch: fix/418-edge-aware-monster-turns
  ──────
  1. Bron voor Wapenbereik: Canonieke Atlas Equipment Resolutie

  A. Geen parsing van sjabloon-beschrijvingen

  De desc-velden van monsteracties in public/assets/atlas/enemies/json/ bevatten sjabloon-placeholders (zoals
  "[[/attack extended]]. [[/damage extended]]."). We parsen deze strings niet voor bereik.

  B. Resolutie via canonieke Atlas Equipment JSON

  In plaats daarvan koppelen we de actienaam (bijv. "scimitar", "shortbow", "greataxe", "javelin") aan het
  overeenkomstige canonieke uitrustingsrecord via de bestaande dataconventies (fetchEquipmentData in
  src/services/storageService.ts, die zowel in Node/test als in browseromgevingen werkt):

  • Bronbestand: public/assets/atlas/equipment/json/{ruleset}/weapon/{weapon-index}.json
  • Relevante metadata:
      • weapon_range: "Melee" | "Ranged"
      • properties: array met o.a. { index: "thrown" }, { index: "reach" }
      • range.normal: normale dracht in voet (bijv. 80 voor Shortbow, 30 voor Javelin, 150 voor Longbow)
      • range.long: lange dracht in voet (blijft buiten beschouwing zolang nadeel/disadvantage nog niet ondersteund
      wordt)


  C. Formule voor bereik in rastercellen

  • Conform docs/systems/TACTICAL_COMBAT_ENGINE.md geldt: 1 rastercel = 5 voet.
  • Normaal bereik:

    attackRange = max(1, ⌊range.normal/5⌋)

  • Specifiek voor geworpen wapens (Thrown):
  Wapens zoals Javelin hebben weapon_range: "Melee", maar bezitten de eigenschap thrown met range: { normal: 30,
  long: 120 }.
  Als properties de eigenschap thrown bevat, wordt het normale werpbereik gerespecteerd:

    ⌊30/5⌋ = 6 cellen

  • Melee zonder thrown:
      • Indien reach eigenschap aanwezig: ⌊10/5⌋ = 2 cellen.
      • Standaard melee: 5/5 = 1 cel.
  • Geen verzonnen bereik:
  Als de wapenmetadata niet kan worden herleid (bijv. natuurlijke aanvallen zoals Bite of Claw die niet in equipment
  staan):
      • Natuurlijke aanvallen behouden standaard melee-bereik (1 cel = 5 ft reach).
      • Er wordt geen fictief afstandsbereik gefabriceerd.
  • Behoud van monster-aanvalsdata:
  attack_bonus en damage (dobbelsteen en type) blijven 100% afkomstig uit de monsteractie zelf in Atlas (action.
  attack_bonus en action.damage). We vervangen monsterschade nooit door generieke uitrustingsschade.
  ──────
  2. Normalisatie van Creature Size voor Pathfinding

  De signatuur van findPath in src/components/combat/combatUtils.ts accepteert:

    creatureSize: 'Medium' | 'Large' = 'Medium'

  • In 5e regels en rastertactiek bezetten zowel Small (zoals de Goblin) als Medium wezens een voetafdruk van 1 × 1
  cel (5 ft space).
  • Large wezens bezetten een voetafdruk van 2 × 2 cellen (10 ft space).
  • We normaliseren updatedMonster.size voorafgaand aan findPath:
    const normalizedSize: 'Medium' | 'Large' = (updatedMonster.size === 'Large') ? 'Large' : 'Medium';
  Hierdoor geven we nooit ongevalideerde strings door en blijft de voetafdrukcontrole van findPath wiskundig correct.
  ──────
  3. Beurt-levenscyclus en Strikt Lokale Contextvalidatie

  Om beurtverloop deterministisch te houden zonder een zwaar globaal timer-framework te introduceren, valideren we de
  actieve gevechtscontext direct vóór elke actie en vóór elke nextTurn aanroep:

  Context-validator (isValidTurnContext)

    const turnActorId = monsterId;
    const turnIndex = currentCombatState.activeTurnIndex;

    const isValidTurnContext = (): boolean => {
      const state = get();
      // 1. Gevecht moet actief zijn
      if (state.combatState.initiativeOrder.length === 0) return false;
      if (useUIStore.getState().gameMode !== 'combat') return false;
      // 2. Beurtindex en actor moeten exact overeenkomen met het moment van dispatch
      if (state.combatState.activeTurnIndex !== turnIndex) return false;
      const currentActor = state.combatState.initiativeOrder[turnIndex];
      if (!currentActor || currentActor.id !== turnActorId) return false;
      // 3. Monster moet nog bestaan en in leven zijn
      const freshMonster = state.combatState.monsters.find(m => m.id === turnActorId);
      if (!freshMonster || freshMonster.hp <= 0) return false;
      return true;
    };

  Veilige eenmalige doorgifte (advanceTurnOnce)

    let turnAdvanced = false;
    const advanceTurnOnce = () => {
      if (turnAdvanced) return;
      // Een handmatig doorgegeven beurt, beëindigd gevecht of verslagen actor invalideert de aanroep
      if (!isValidTurnContext()) return;
      turnAdvanced = true;
      get().nextTurn();
    };

  Validatie-momenten:

  1. Bij het binnengaan van de timeout: if (!isValidTurnContext()) return;
  2. Vóór verplaatsing: Controleer isValidTurnContext().
  3. Vóór resolveCombatAction: Controleer isValidTurnContext().
  4. Na await resolveCombatAction: Controleer isValidTurnContext().
  5. Bij beurt-afronding: advanceTurnOnce().
  ──────
  4. Actief Gevecht vs. Geblokkeerde Doelwitten: De Cruciale Scheiding

  We maken een strikt onderscheid tussen doellocatie voor navigatie en fysieke zichtlijn voor aanvallen:

    [Actieve Gevechtsstatus]
    Monster kent globale positie van actieve PC's (targetPos)
           │
           ▼
    [Pathfinding / Navigatie]
    findPath(monsterPos, targetPos, grid, monsters, pcPositions, normalizedSize, combatState.walls)
       ├─ Muren en gesloten deuren BLOKKEREN directe oversteek.
       ├─ Route zoekt fysieke doorgang om muurgrenzen heen en door open deuren.
       └─ Monster beweegt langs de legale route tot maximale snelheid.
           │
           ▼
    [Gevechtsinteractie & Aanval]
    checkLoS(updatedMonsterPos, targetPos, grid, combatState.walls)
       ├─ Randmuren (type: 'wall') en gesloten deuren (doorState !== 'open') BLOKKEREN de straal.
       ├─ Actieve gevechtsstatus geeft GEEN zicht door muren of gesloten deuren.
       └─ Aanval mag UITSLUITEND worden uitgevoerd indien:
             1. Afstand <= attackRange (Chebyshev)
             2. checkLoS === true (volledig ongehinderde zichtlijn)
  ──────
  5. Gerichte Regressietests (tests/hostile_turn_combat.test.ts)

  De testsuite laadt zowel de echte Atlas monster-JSON als de echte Atlas equipment-JSON:

  1. Goblin Atlas & Equipment Integratie:
      • Laadt tjwqogi3a4ual7lc.json (Goblin) en equipment/json/14/weapon/scimitar.json + shortbow.json.
      • Bewijst dat Nimble Escape (damage: []) wordt verworpen als aanval.
      • Bewijst dat op afstand 1 cel Scimitar wordt geselecteerd met monsterschade 1d6-1 slashing en bereik 1 cel.
      • Bewijst dat op afstand 4 cellen Shortbow wordt geselecteerd met monsterschade 1d6-1 piercing en bereik ⌊80/5⌋
      = 16 cellen.
  2. Orc Atlas & Equipment Integratie (Thrown Javelin):
      • Laadt hb49mcovbxwwekwq.json (Orc) en equipment/json/14/weapon/greataxe.json + javelin.json.
      • Bewijst dat Aggressive (damage: []) wordt verworpen.
      • Bewijst dat op afstand 1 cel Greataxe wordt geselecteerd (1d12+3 slashing, bereik 1).
      • Bewijst dat op afstand 4 cellen Javelin wordt geselecteerd met het werpbereik ⌊30/5⌋ = 6 cellen (ondanks
      weapon_range: "Melee").
  3. Uitsluiting van verzonnen schade:
      • Bewijst dat een entiteit zonder geldige schadedata in acties resulteert in null en geen fictieve aanval
      fabriceert.
  4. Muren en gesloten deuren:
      • Bewijst dat checkLoS met combatState.walls false retourneert door muren en gesloten deuren.
      • Bewijst dat findPath met combatState.walls een route plant door de deuropening en niet door de muur.
      • Bewijst dat een vijand binnen wapenbereik maar gescheiden door een muur geen aanval uitvoert.
  5. Aanvalsuitvoering:
      • Bewijst dat een vijand met LoS binnen bereik resolveCombatAction bereikt.
  6. Beurt-doorgifte en Invalidering:
      • Bewijst dat een hostile turn exact één keer advanceert.
      • Bewijst dat een verslagen monster of beëindigd gevecht de hangende timeout invalideert zonder spookaanval of
      dubbele advance.

  ──────
  6. Exacte Bestandenlijst

  1. src/store/useGameStore.ts
      • startCombat: zet actieve vijanden in awareness: 'combat'.
      • executeMonsterTurn:
          • Doorgeven van currentCombatState.walls aan checkLoS.
          • Doorgeven van normalizedSize en currentCombatState.walls aan beide findPath call-sites.
          • Canonieke Atlas equipment-resolutie voor wapenbereik (fetchEquipmentData).
          • Strikt filteren van acties op aanwezigheid van damage[0].damage_dice.
          • Verwijderen van alle verzonnen fallbacks (Longbow, Fire Bolt, Claw/Bite).
          • Verse LoS-verificatie met combatState.walls direct vóór aanval.
          • Lokale isValidTurnContext en advanceTurnOnce beveiligingen.

  2. tests/hostile_turn_combat.test.ts (nieuw testbestand)
      • De 6 hierboven gedefinieerde regressietests met echte Atlas-bestanden.
  3. docs/systems/TACTICAL_COMBAT_ENGINE.md
      • Bijwerken van de sectie AI combat met de randbewuste geometrie, canonieke equipment-resolutie en
      beurtlevenscyclus.
  4. docs/ARCHITECTURE_STATUS.md
      • Statusupdate voor Issue #418 onder Tactical Combat Engine.

  ──────
  7. Verificatie-opdrachten

  • bun test tests/hostile_turn_combat.test.ts
  • bun test tests/combat_integration.test.ts
  • bun test tests/battle_map_v2_schema.test.ts
  • npm run test:workflow
  • npm run lint
  • git diff --check
  ──────
  Dit plan is gereed en strikt afgebakend binnen Issue #418. Ik wacht op je review en formele goedkeuring om over te
  gaan naar de implementatiefase.

> /config
  ⎿  Exited /config command

────────────────────────────────────────────────────────────
> The final Issue #418 plan is approved.

  Switch to Default/Execute mode with approval prompts and implement
  the approved plan on:

  fix/418-edge-aware-monster-turns

  Additional implementation constraints:

  1. Preserve canonical monster size:
  - addMonsterToCombat currently maps Atlas data into CombatMonster.
  - Ensure the Atlas monster size is preserved in the runtime monster.
  - Normalize Small to Medium only when calling the existing findPath API.
  - Large creatures must retain their Large footprint.

  2. Equipment ruleset:
  - Resolve equipment through fetchEquipmentData(index, ruleset).
  - Use the correct active/source ruleset consistently.
  - Do not hardcode a ruleset or bypass the existing Atlas lookup.

  3. Attack selection:
  - Prefer a valid melee attack when the target is within melee reach.
  - Prefer a valid ranged/thrown attack when the target is outside melee reach and within normal range.
  - Do not make the result accidentally depend on Atlas array ordering.
  - Keep attack_bonus and damage from the monster action itself.

  4. Initiative removal:
  - Inspect removeMonsterFromCombat and activeTurnIndex handling.
  - Ensure removing the active monster cannot leave initiative stuck or point at the wrong actor.
  - Keep this correction minimal and local to the existing combat lifecycle.
  - Do not allow a stale asynchronous callback to advance a newer actor's turn.

  Implementation requirements:
  - Follow the approved plan and Gameplay Specialist contract.
  - Use real Atlas monster and equipment data in regression tests.
  - Keep all changes within Issue #418 scope.
  - Do not modify BattleMap Editor or Atlas JSON.
  - Do not redesign the full action economy or implement Issue #371.
  - Update the two specified documentation files.
  - Run all six verification commands from the plan.
  - Report exact changed files, test results, and any remaining limitations.

  Do not merge anything.
  Stop after implementation and verification so the changes can be reviewed.

○ Thought for 2m 36s (Edge-aware hostile turn lifecycle details need documenting within the specified file. The 'Aw...)
● Ran 2 commands (git status · git log -n 3 --oneline)
● Explored 1 file (useGameStore.ts)
… 19 more actions (7 reads, 8 edits, 4 commands: 1 failed) …
● Explored 2 files (TACTICAL_COMBAT_ENGINE.md, ARCHITECTURE_STATUS.md)
● Edited 2 files (TACTICAL_COMBAT_ENGINE.md, ARCHITECTURE_STATUS.md) (ctrl+o to expand)

⚠ Individual quota reached. Please upgrade your subscription to increase your limits. Resets in 162h21m5s.
Error ID: 6218ae34-18e1-4a2f-a045-a8ecddd71983-401

 How's the CLI experience so far? Help us improve:
 [1] Good  [2] Fine  [3] Bad  [0] Skip