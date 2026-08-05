# 🎨 Artificer House Style Guide

This document defines the visual language for the **Artificer** project. All agents and developers should strictly adhere to these guidelines to ensure UI/UX consistency across the application and generated content.

## 🏛️ The "Parchment & Dragonstone" Aesthetic

Artificer does **not** follow the typical "modern dark mode" trend. Instead, it uses a tactile, physicalist aesthetic inspired by ancient grimoires, dungeoneering journals, and arcane blueprints.

### 🎨 Color Palette

| Name | Hex Code | Description |
| :--- | :--- | :--- |
| **Parchment Base** | `#f9f4e8` | Primary background color (Light, warm off-white). |
| **Dragon Red** | `#8b0000` | Primary accent color for headers, buttons, and "danger" elements. |
| **Dragon Gold** | `#d4af37` | Secondary accent color for borders, highlights, and legendary items. |
| **Deep Charcoal** | `#523b23` | Primary text color (Warm brown-black) for high legibility on parchment. |
| **Dragon Dark Red**| `#5a0000` | Deepest red used for dark text variations or deep shadows. |

### 🖋️ Typography

Typography is the "soul" of this project. Use the following font pairings:

- **Display Headers**: `Cinzel`, `Cinzel Decorative` (Classic, serif, grandiose).
- **Utility Headers**: `Anton`, `Rajdhani` (Impactful, semi-condensed for data/stats).
- **Body Text**: `Crimson Text`, `STIX Two Text` (Elegant, traditional serif reading experience).
- **Technical/Mono**: `JetBrains Mono` (Clean, technical for values and logs).
- **Ancient Script**: `Elvish`, `Handjet` (Used for flavor and mysterious accents).

### 📐 Visual Layout & Texture

1. **Textures**: Always overlay components with the `bg-paper-texture` utility (defined in `index.css`). Use the `old_paper.webp` background for large surfaces.
2. **Physicality & Elevation**:
   - **Shallow**: `shadow-md border border-dragon-gold/10` (standard cards).
   - **Lifted**: `shadow-xl border-dragon-gold/30 -translate-y-0.5` (hover states).
   - **Deep**: `shadow-inner bg-parchment-200/50` (pockets, inset wells).
3. **Interactive States**:
   - **Buttons**: Use `bg-dragon-red` with `text-parchment-50`. On hover, use `brightness-110 shadow-lg`.
   - **Click Feedback**: Add `active:scale-95 transition-transform` to clickable elements for a tactile feel.
4. **Character Art**:
   - Use **Chroma Keying** (via `ChromaKeyImage` component) for portraits to eliminate backgrounds.
   - Assets should look like physical Standees or cutouts with a subtle drop shadow.

## ✨ "Arcane" Special Effects (Magic)

For legendary items, high-level spells, or "Critical" moments:
- **Gifts of the Dragon**: Use `drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]` for a golden glow.
- **Blood of the Mountain**: Use `animate-pulse-slow` with `text-dragon-red` for rhythmic, organic pulsing.
- **Glint**: Use a subtle diagonal linear gradient shimmer for "new" or "unidentified" items.

## 🤖 Art Style for AI Generators

This section contains the exact prompts, parameters, and style guidelines utilized by Artificer's visual generators. Use these blocks in external image generators (such as Midjourney, Stable Diffusion, or DALL-E) to recreate the signature high-fantasy look.

### 🟢 The Critical Background Rule
To enable seamless chroma keying and standee cutouts in-game, all subjects (Characters, Monsters, Equipment, Materials) must be isolated on a pure green background.

```text
CRITICAL BACKGROUND RULE:
- The background MUST be a 100% solid, flat, matte, uniform chroma key green (#00FF00) from edge to edge.
- THE SUBJECT MUST BE THE ONLY THING IN THE IMAGE.
- NO floors, NO walls, NO arches, NO ceilings, NO furniture, NO props, NO environment.
- NO shadows on the background, NO gradients, NO lighting effects on the background.
- NO VIGNETTE, NO BORDERS, NO FRAME, NO EDGE DARKENING, NO CORNER SHADOWS.
- The green background must be perfectly uniform with no lighting falloff.
- The subject should appear as if it is floating in a pure, flat green digital void.
```

### 🎨 Core Aesthetics & Composition
Every standalone asset prompt should append the following configuration:

```text
ART STYLE: Cinematic, Baldur's Gate 3 / classic D&D style, adult-themed, gritty texture.
COMPOSITION: Centered, dynamic pose.
NO text, NO labels, NO characters, NO people, NO hands.
NO cartoon, NO mobile game, NO low-quality, NO kids style.
```

---

### 🛡️ Equipment Prompts (Aspect Ratio: `9:16`)

#### Tier 0 / Standard Item
> **Prompt:** `A high-fidelity, cinematic digital painting of [Item Name], a [Item Type]. Focus on the item's craftsmanship and functional detail (e.g., forged steel, worn leather, polished wood). The item should be presented as a high-quality, realistic object. NO text, NO labels, NO characters, NO people, NO hands.`

#### Tier 1 / Uncommon Item (+1)
> **Prompt:** `A high-fidelity, cinematic digital painting of [Item Name], a uncommon [Item Type]. This is an UNCOMMON MAGICAL item. It should look like high-quality gear but with subtle magical enhancements. Add fine silver/gold filigree, a couple of glowing runes, or a faint, clean magical sheen that distinguishes it from mundane equipment. NO text, NO labels, NO characters, NO people, NO hands.`

#### Tier 2 / Rare Item (+2)
> **Prompt:** `A high-fidelity, cinematic digital painting of [Item Name], a rare [Item Type]. This is a RARE MASTERWORK item. It should feature intricate engravings filled with glowing magical energy, superior polished surfaces, and a distinct magical presence. Add subtle visual effects like faint swirling energy or shimmering surfaces that suggest significant magical power. NO text, NO labels, NO characters, NO people, NO hands.`

#### Tier 3 / Legendary Item (+3)
> **Prompt:** `A high-fidelity, cinematic digital painting of [Item Name], a legendary [Item Type]. This is a LEGENDARY ARTIFACT. It should look incredibly ornate and powerful. Add pulsing magical energy cores, brilliant glowing runes that illuminate the item, floating ethereal particles, and exotic legendary materials like celestial gold or void-iron. The item should radiate an intense, awe-inspiring magical aura. NO text, NO labels, NO characters, NO people, NO hands.`

---

### 👤 Character Prompts (Aspect Ratio: `3:4`)

#### Novice Traveler (Levels 1 - 4)
> **Prompt:** `A high-fidelity, cinematic digital painting of a level [Level] [Class/Race] named [Name]. The character is a NOVICE TRAVELER. Their equipment is basic and functional—raw leather, simple iron, and sturdy canvas. They look eager but relatively fresh-faced and less seasoned. The character should be rendered as a realistic D&D adventurer. Focus on period-accurate materials like worn leather, forged steel, and textured fabrics.`

#### Experienced Adventurer (Levels 5 - 9)
> **Prompt:** `A high-fidelity, cinematic digital painting of a level [Level] [Class/Race] named [Name]. The character is an EXPERIENCED ADVENTURER. Their gear is high-quality and well-maintained, but shows signs of many travels. Add some refined details like silver filigree or specialized tool belts. They look confident and capable. The character should be rendered as a realistic D&D adventurer. Focus on period-accurate materials like worn leather, forged steel, and textured fabrics.`

#### Legendary Hero (Level 10+)
> **Prompt:** `A high-fidelity, cinematic digital painting of a level [Level] [Class/Race] named [Name]. The character is a LEGENDARY HERO. Their equipment is highly ornate, featuring intricate engravings, subtle magical glowing runes, and prestigious materials like mithral or dragon-leather. Their expression is battle-hardened and wise. The character radiates an aura of immense power and experience. The character should be rendered as a realistic D&D adventurer. Focus on period-accurate materials like worn leather, forged steel, and textured fabrics.`

---

### 🐉 Monster Prompts (Aspect Ratio: `3:2`)

#### Beast (Tiny / Small / Adorable)
> **Prompt:** `The creature MUST be rendered as a realistic, natural, and adorable animal. Focus on soft fur, expressive but natural eyes, and a docile or curious posture. ABSOLUTELY NO monstrous features, NO glowing runes, NO horrific mutations, NO aggressive spikes, NO demonic elements. It should look like a high-quality nature documentary photograph turned into a painting.`

#### Beast (Large / Standard Wild Beasts)
> **Prompt:** `The creature MUST be rendered as a realistic, powerful natural animal. Focus on organic textures, realistic anatomy, and natural lighting. Avoid overly magical or demonic embellishments unless specified in the lore. It should feel like a legendary beast from a high-fantasy world, but grounded in biology.`

#### Celestial
> **Prompt:** `The creature should radiate divine majesty and ethereal beauty. Focus on radiant light, golden or pearlescent textures, and a sense of serene power. It can have subtle glowing elements or holy auras.`

#### Fiend (Demon Subtype)
> **Prompt:** `DEMONIC STYLE: Chaotic, bizarre, and terrifying. Focus on asymmetrical features, multiple eyes or limbs, raw fleshy textures, and horrific mutations. It should feel unpredictable and visceral. Use Abyssal motifs.`

#### Fiend (Devil Subtype)
> **Prompt:** `INFERNAL STYLE: Sinister, majestic, and law-bound. Focus on clean but menacing lines, red or obsidian skin, symmetrical proportions, elegant horns, and a sense of cruel authority. Use Infernal jewelry or armor motifs.`

#### Undead / Standard Monstrosity
> **Prompt:** `UNDEAD STYLE / FIENDISH STYLE: The creature should look horrific, gritty, and decaying/menacing. Focus on dark textures, glowing malevolent eyes, and jagged, aggressive features. It should feel dangerous and unnatural.`

---

### 🌿 Material & Specimen Prompts (Aspect Ratio: `9:16`)

#### Botanical Specimens (Herbs, Roots, Sprigs)
> **Prompt:** `The material MUST be presented as a freshly picked botanical specimen (sprig, leaf, or root). It should look organic, raw, and harvested. ABSOLUTELY NO leather straps, NO labels, NO furniture, NO props. Focus on natural plant textures. NO characters, NO people, NO hands, NO creatures in the image.`

#### Monster Parts (Scales, Horns, Glands, Blood Vials)
> **Prompt:** `The material MUST be presented as a raw organic component from a legendary creature. It should look like a visceral trophy but raw and un-decorated. Focus on exotic biology and gritty textures. NO characters, NO people, NO hands, NO creatures in the image.`

#### Oils & Potions (Glass Vials)
> **Prompt:** `The material MUST be presented as an elegant glass vial or bottle containing a translucent fluid. Focus on light refraction, fluid viscosity, and the craftsmanship of the glass. NO characters, NO people, NO hands, NO creatures in the image.`

#### Consumables (Rations, Food)
> **Prompt:** `The material MUST be presented as the item itself. Focus on realistic, gritty textures of the object. NO environment or context. NO characters, NO people, NO hands, NO creatures in the image.`

#### Bundled Goods (Twine Bundles)
> **Prompt:** `The material MUST be presented as a neatly tied bundle wrapped with simple twine. Focus on the organized stack and the texture of the material being bundled. NO characters, NO people, NO hands, NO creatures in the image.`

#### Metals (Ingots, Bars)
> **Prompt:** `The material MUST be presented as a solid, rectangular ingot or bar of metal. Focus on its metallic luster, sharp edges, and realistic reflections. NO text or engravings on the metal. NO characters, NO people, NO hands, NO creatures in the image.`

#### Ores & Minerals (Chunks, Crystals)
> **Prompt:** `The material MUST be presented as a raw, jagged chunk of ore. Focus on the contrast between the rocky stone matrix and the embedded mineral veins. NO text or labels. NO characters, NO people, NO hands, NO creatures in the image.`

#### Woods (Logs, Planks)
> **Prompt:** `The material MUST be presented as a cut log or a thick plank of wood. Focus on the natural grain, bark texture, and organic rings. NO text or carvings. NO characters, NO people, NO hands, NO creatures in the image.`

---

### 🌄 Background / Habitat Perspectives (Aspect Ratio: `16:9`)

When designing environments or scenery plates, use the following composition configurations:

#### Macro Perspective (Low-Angle / For Small Creatures or Close-Ups)
> **Prompt:** `MACRO PERSPECTIVE: A extreme low-angle, ground-level 'ant's eye view'. The camera is placed directly on the soil/floor. Focus on the micro-details of the immediate foreground: individual blades of grass, detailed pebbles, moss textures, and low-lying roots. The background should have a shallow depth of field with a beautiful bokeh effect, making the environment feel vast but seen from a tiny creature's height. The horizon line should be very high or obscured by foreground elements.`

#### Wide Perspective (Epic zoomed-out views / For Large Entities)
> **Prompt:** `WIDE PERSPECTIVE: An epic, zoomed-out, wide-angle shot with a massive sense of scale. The camera is placed far back to capture the vastness of the environment. Focus on grand landmarks, distant horizons, and a deep depth of field. This is a 'god's eye view' or a distant observer's view, perfect for showcasing huge, gargantuan entities. The environment should feel immense and overwhelming in its scale.`

#### Cinematic Perspective (Standard Lands)
> **Prompt:** `CINEMATIC PERSPECTIVE: A wide-angle, epic landscape view with a broad horizon and deep depth of field. Focus on the grand scale of the environment.`

---
*Last updated: 2026-06-08*
