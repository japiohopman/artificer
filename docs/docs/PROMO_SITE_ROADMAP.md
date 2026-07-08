# Artificer Promo Site Roadmap

## Doel
Deze map is bedoeld als overdracht voor iemand die de promotiesite verder gaat bouwen en later eventueel in een eigen repository zet.

De site moet Artificer verkopen als een onafhankelijke, system-neutral all-round GM kit. Vermijd publieke afhankelijkheid van een specifiek tabletop merk. De kernboodschap:

> Artificer is een campagne-commandocentrum voor game masters: wereldatlas, campaign memory, character vault, tactical table, dice, soundscape en AI-ready orchestration.

## Stackadvies

### Nu: plain HTML/CSS/JS
Houd de site voorlopig plain.

Redenen:
- Geen build-stap nodig.
- Gemakkelijk naar eigen repo of statische hosting te verplaatsen.
- Perfect voor een Kickstarter/Buy Me a Coffee landingpage.
- Minder kans dat de promotiesite de hoofdapp vervuilt.
- Snel te reviewen door iemand die geen projectsetup kent.

### Niet nu: Bootstrap
Bootstrap is handig voor snelheid, maar geeft snel een generieke SaaS-look. Artificer heeft juist een eigen premium fantasy-tool uitstraling nodig. Gebruik Bootstrap alleen als een collega echt snel forms, modals of grids moet opleveren en visuele eigenheid minder belangrijk wordt.

### Later: EJS of static generator
EJS wordt pas interessant als er meerdere pagina's komen met gedeelde layout:
- `index`
- `press-kit`
- `roadmap`
- `updates`
- `faq`
- `backer-rewards`

Als het groter wordt dan EJS, kies liever Astro of Eleventy. Die blijven licht, statisch en geschikt voor contentpagina's.

Aanbevolen evolutie:
1. Plain HTML/CSS/JS voor de eerste campagnepagina.
2. Eleventy of Astro als er echte contentstructuur ontstaat.
3. Geen React tenzij de site interactief productdemo's gaat bevatten.

## Visuele Richting

De site moet niet voelen als een standaard template. Richting:
- premium campaign dashboard
- donker, filmisch, leesbaar
- echte screenshots centraal
- brede hero met productbeeld
- korte, harde claims
- duidelijke CTA's naar Kickstarter en Buy Me a Coffee

Vermijd:
- te veel lore-tekst
- generieke fantasy stockbeelden
- D&D als hoofdpositionering
- drukke kaarten-in-kaarten layouts
- te veel paarse gradients of standaard Bootstrap-blokken

## Promotieboodschap

### One-liner
Run bigger worlds with less table chaos.

### Korte pitch
Artificer is an all-round GM kit for tabletop campaigns: a living atlas, campaign journal, character vault, tactical encounter table, dice, inventory, soundscape and AI-ready orchestration in one focused workspace.

### Lange pitch
Artificer helps game masters keep the whole table in motion. It combines world state, travel, journal, character management, tactical encounters and atmospheric tools into a single command desk. The goal is not to replace the GM, but to remove bookkeeping friction so the GM can focus on choices, consequences and story.

## Uit Te Lichten Modules

Gebruik bestaande projectdocumentatie als bron, maar herschrijf publiek vriendelijk.

### Atlas Service
Bron: `docs/modules/atlasService.md`

Promotiehoek:
- De Atlas is de "reality database" van Artificer.
- Locaties, items, enemies en world data worden centraal geladen.
- Belangrijk voor betrouwbaarheid: AI mag niet zomaar verzinnen; data heeft structuur.

Site-copy:
> A structured Atlas keeps campaign reality consistent: locations, entities, gear and world data are available as a reliable source of truth.

### Journal
Bron: `docs/modules/journal.md`

Promotiehoek:
- Campaign memory.
- Quest log, diary, lore, bestiary.
- Later de basis voor AI session summaries.

Site-copy:
> The journal turns play into memory: quests, discoveries, bestiary notes and session history stay connected to the world.

### Dice System
Bron: `docs/modules/dice_system.md`

Promotiehoek:
- Tactile dice experience.
- Roll context en mechanical auditability.
- Niet alleen random nummers, maar tafelgevoel.

Site-copy:
> Dice stay visible, tactile and contextual, keeping rolls part of the table instead of hidden automation.

### Inventory V2
Bron: `docs/modules/inventory_v2.md`

Promotiehoek:
- Character vault en equipment logic.
- Containers, slots, carried gear.
- GM en speler verliezen minder tijd aan administratie.

Site-copy:
> Inventory is handled as real campaign logistics: equipment, containers, slots and character state stay organized.

### Sound Engine
Bron: `docs/modules/soundService.md`

Promotiehoek:
- Atmosphere engine.
- Scene-aware soundscapes.
- Later AI-triggered mood shifts.

Site-copy:
> Layered soundscapes give scenes a pulse and can grow into narration-aware atmosphere control.

### Save System
Bron: `docs/modules/saveService.md`

Promotiehoek:
- Persistence.
- Characters and campaign state are not throwaway.
- Voor publieke site niet te technisch maken.

Site-copy:
> Campaign work persists, so characters, progress and world changes can survive beyond one session.

### Minigames
Bron: `docs/modules/minigames.md`

Promotiehoek:
- Social and table moments.
- Optional interactive tools.
- Niet als core pitch, eerder als stretch/future feature.

Site-copy:
> Optional table tools can support social scenes, downtime and special campaign moments.

## Roadmap Voor De Site

### Phase 1: Foundation
Status: started.

Taken:
- Houd alles in `site/`.
- Gebruik `site/assets/` voor promo images.
- Vervang tijdelijke Kickstarter URL.
- Vervang tijdelijke Buy Me a Coffee URL.
- Voeg echte project/contactnaam toe.
- Controleer mobiele layout.
- Maak hero screenshot scherper indien nodig.

### Phase 2: Campaign Readiness
Doel: geschikt maken voor eerste publieke traffic.

Taken:
- Voeg een korte maker story toe.
- Voeg een "why now" sectie toe.
- Voeg FAQ toe:
  - Is this tied to one rules system?
  - Does it replace the GM?
  - Is there a playable demo?
  - What are backers funding?
  - What is the first release goal?
- Voeg press kit sectie toe met logo, screenshots en korte pitch.
- Voeg een duidelijke disclaimer toe: independent tabletop toolkit.
- Maak CTA's concreet:
  - Back on Kickstarter
  - Support on Buy Me a Coffee
  - Follow development

### Phase 3: Demo Proof
Doel: mensen laten zien dat het werkt.

Taken:
- Voeg een video embed toe zodra er een walkthrough is.
- Maak een demo flow:
  - world map
  - character profile
  - journal
  - tactical grid
  - dice
  - soundscape
- Voeg 3 korte use cases toe:
  - prep a session
  - run travel
  - resolve an encounter
- Voeg "built already" vs "funding next" toe.

### Phase 4: Kickstarter Launch
Doel: converteren.

Taken:
- Kickstarter hero bovenaan zodra campagne live is.
- Funding goal uitleggen in gewone taal.
- Backer rewards toevoegen.
- Stretch goals alleen toevoegen als ze realistisch zijn.
- Social proof toevoegen: screenshots, devlog, playtest quotes.
- Nieuwsbrief of mailinglijst toevoegen.

### Phase 5: Eigen Repo
Doel: site loskoppelen.

Taken:
- Kopieer volledige `site/` map naar nieuwe repo.
- Zet `site/index.html` in repo-root of behoud `site/` als public folder.
- Controleer assetpaden na verplaatsen.
- Voeg eigen `README.md` toe voor deploy.
- Publiceer via GitHub Pages, Netlify, Vercel of Cloudflare Pages.

## Todo Voor Collega

Prioriteit 1:
- Vervang tijdelijke supportlinks.
- Review alle Engelse copy op helderheid.
- Kies definitieve productnaam: Artificer of Arcane Codex.
- Maak één consistente CTA-hiërarchie.
- Check mobile first.

Prioriteit 2:
- Voeg FAQ en maker story toe.
- Maak screenshots lichter/compress voor snellere laadtijd.
- Voeg social preview image toe.
- Voeg favicon toe.
- Maak een `press-kit` submap.

Prioriteit 3:
- Maak video trailer.
- Voeg email capture toe.
- Maak campagne-update template.
- Maak aparte roadmap/updates pagina.

## Contentregels

- Praat over "GM", "tabletop", "campaigns", "world state", "atlas", "encounters".
- Vermijd "D&D" als primaire marketingterm.
- Zeg niet dat AI de GM vervangt.
- Zeg dat AI de GM ondersteunt met structured tools.
- Gebruik echte screenshots boven decoratieve beelden.
- Maak claims concreet: wat bestaat nu, wat wordt gefund, wat komt later.

## Bestandsstructuur

Aanbevolen structuur:

```text
site/
  index.html
  styles.css
  script.js
  assets/
    promo_world_map_wide.png
    promo_world_map_with_panels.png
    promo_character_profile_full.png
    promo_journal.png
    promo_dice_roller.png
    combat_hud_canvas_grid.png
  docs/
    PROMO_SITE_ROADMAP.md
    TODO.md
```

## Beslissing

Voor nu: plain houden.

Niet omdat we klein denken, maar omdat de campagnepagina vooral scherp, snel, overdraagbaar en betrouwbaar moet zijn. Ga pas "helemaal los" met templates of framework wanneer het promomateriaal zelf klaar is: echte links, video, maker story, demo mode en backer tiers.
