import json
import re
import os
from datetime import datetime, timezone

# Define file paths
shops_path = 'public/assets/atlas/world/toril/faerun/cities/waterdeep/sublocations/shops.json'
npc_dir = 'public/assets/atlas/characters/npc/'

# Load existing shop data
with open(shops_path, 'r') as f:
    data = json.load(f)

# Collect all shop names to avoid creating NPCs for shops
shop_names = {s['name'].lower() for s in data['sub_locations']}
shop_ids = {s['id'].lower() for s in data['sub_locations']}

# Helper to generate a slug from a name
def get_slug(name):
    return re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')

# Define keyword mapping for shop archetypes
archetype_keywords = [
    ('monster_shop', ['monster shop']),
    ('smithy', ['smithy', 'blacksmith', 'metalware', 'armorer', 'weapons', 'swords', 'blades', 'shields', 'metal', 'iron', 'steel', 'metalwares', 'silversmith']),
    ('apothecary', ['apothecary', 'herbal', 'medicines', 'potions', 'philtres', 'component', 'balms', 'alchemy', 'potion', 'poison']),
    ('tailor', ['tailor', 'silks', 'clothiers', 'weaver', 'textiles', 'finework', 'gowns', 'masks', 'clothing', 'silks']),
    ('leatherworker', ['leather', 'tannery', 'furs', 'furriers', 'boots', 'shoes', 'tanner']),
    ('jeweler', ['jeweler', 'gems', 'jewelry', 'jewels', 'silverware']),
    ('arcane', ['magic', 'arcane', 'spell', 'mystericum', 'curiosities', 'beholder', 'extraordinary', 'curio', 'wondrous']),
    ('stable', ['stable', 'mount', 'gear related to them', 'bit', 'bridle', 'saddle', 'stables']),
    ('harbor', ['harbor', 'shipyard', 'shipwright', 'sails', 'rope', 'ropeworks', 'cordwainers', 'maritime', 'fish', 'fishscale', 'nets', 'neta']),
    ('temple', ['temple', 'shrine', 'church', 'holy', 'devoted']),
    ('bookshop', ['bookshop', 'books', 'folios', 'stationers', 'chapbooks', 'library', 'world of words', 'broadsheets', 'trumpet', 'stationer', 'tomes', 'broadsheet', 'stationery']),
    ('carpenter', ['carpenter', 'furniture', 'woodcraft', 'fine carvers', 'doors', 'sweep begone', 'beds', 'carpentry']),
    ('bowyer', ['bowyer', 'bows', 'crossbows', 'arrows', 'bolts']),
    ('tobacconist', ['tobacconist', 'tobacco', 'pipeweed']),
    ('general_store', ['general store', 'sundries', 'manywares', 'curios', 'trader', 'catalog', 'emporium', 'bank', 'moneychanging', 'pawnshop', 'rentals', 'warehouse', 'storage', 'market', 'hall'])
]

# Define category mapping for equipment and materials
category_mapping = {
    'smithy': (
        ['armor.json', 'heavy_armor.json', 'medium_armor.json', 'light_armor.json', 'shields.json', 'martial_weapons.json', 'simple_weapons.json', 'melee_weapons.json', 'martial_melee_weapons.json', 'simple_melee_weapons.json', 'tools.json'],
        ['refined_materials.json', 'raw_materials.json']
    ),
    'apothecary': (
        ['potion.json', 'kits.json'],
        ['herbs.json', 'consumables.json', 'oils.json']
    ),
    'tailor': (
        ['standard_gear.json', 'head.json'],
        ['common_materials.json', 'bundled_materials.json']
    ),
    'leatherworker': (
        ['boots.json', 'light_armor.json', 'standard_gear.json'],
        ['raw_materials.json', 'common_materials.json']
    ),
    'jeweler': (
        ['ring.json', 'necklace.json', 'head.json'],
        ['refined_materials.json']
    ),
    'arcane': (
        ['arcane_foci.json', 'wand.json', 'staff.json', 'rod.json', 'scroll.json', 'magic_tokens.json', 'wondrous_items.json'],
        ['common_materials.json']
    ),
    'stable': (
        ['mounts_and_other_animals.json', 'mounts_and_vehicles.json', 'tack_harness_and_drawn_vehicles.json'],
        ['consumables.json']
    ),
    'harbor': (
        ['waterborne_vehicles.json', 'adventuring_gear.json', 'tools.json'],
        ['common_materials.json', 'raw_materials.json']
    ),
    'temple': (
        ['holy_symbols.json'],
        ['consumables.json']
    ),
    'bookshop': (
        ['standard_gear.json'],
        ['common_materials.json']
    ),
    'carpenter': (
        ['artisans_tools.json', 'tools.json'],
        ['raw_materials.json', 'refined_materials.json']
    ),
    'bowyer': (
        ['ranged_weapons.json', 'martial_ranged_weapons.json', 'simple_ranged_weapons.json', 'ammunition.json'],
        ['refined_materials.json', 'raw_materials.json']
    ),
    'monster_shop': (
        ['wondrous_items.json', 'kits.json'],
        ['monster_parts.json', 'consumables.json']
    ),
    'tobacconist': (
        ['standard_gear.json'],
        ['consumables.json']
    ),
    'general_store': (
        ['standard_gear.json', 'adventuring_gear.json', 'kits.json', 'tools.json', 'gaming_sets.json'],
        ['common_materials.json', 'bundled_materials.json']
    )
}

# Non-NPC terms found in [[ ]]
non_npc_terms = {
    '1367 dr', 'aurora\'s emporium', 'city guard', 'council of farmer-grocers', 'dr',
    'fishmongers\' fellowship', 'guild of butchers', 'guild of chandlers and lamplighters',
    'guild of fine carvers', 'guild of glassblowers, glaziers, and spectacle-makers',
    'material component', 'components', 'maztica', 'odd street', 'sea of fallen stars',
    'adventurer', 'armor', 'beholder', 'book', 'broadsheet', 'fish', 'hammock', 'harps',
    'herb', 'net', 'nymph', 'perfume', 'pipeweed', 'poison', 'potion', 'rope', 'spell',
    'spices', 'thieves', 'tobacco', 'crommor', 'city guard smithy', 'th', 'dungsweepers\' guild',
    'most diligent league of sail-makers and cordwainers', 'league of skinners & tanners',
    'vintners\', distillers\', & brewers\' guild', 'stationers\' guild', 'undermountain',
    'hawk man', 'mulhorand', 'skuld', 'sune', 'sel\u00fbne', 'north ward', 'trades ward',
    'field ward', 'waterdeep', 'faer\u00fbn', 'bazaar street', 'trader\'s way', 'prostitutes',
    'dock workers', 'mercenaries', 'adventurers', 'misfits', 'soldiers', 'guards', 'watchmen',
    'caravan drovers', 'halflings', 'dwarves', 'elves', 'half-elves', 'nymphs', 'pegasi',
    'laskalan\'s lamps and lanterns', 'erro alhandrar\'s nets', 'demra samdro\'s best beds',
    'tantra jaressra\'s fine gowns', 'vressa\'s sweep begone', 'tiger\'s eye'
}

# Helper to create an NPC JSON file and return its reference
def create_npc(name, shop_name):
    slug = get_slug(name)
    path = os.path.join(npc_dir, f'{slug}.json')
    if not os.path.exists(path):
        npc_data = {
            "id": slug,
            "name": name,
            "backstory": f"{name} is a known figure in Waterdeep, associated with {shop_name}.",
            "updated_at": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        }
        with open(path, 'w') as f:
            json.dump(npc_data, f, indent=2)
    return {
        "index": slug,
        "name": name,
        "url": f"public/assets/atlas/characters/npc/{slug}.json"
    }

# Track created NPCs to avoid duplication
created_npcs = {}

# Cleanup target directory
if os.path.exists(npc_dir):
    for f in os.listdir(npc_dir):
        if f.endswith('.json'):
            os.remove(os.path.join(npc_dir, f))

# Process each shop in the sub_locations array
for shop in data['sub_locations']:
    desc = shop['popup'].get('description', '')
    name = shop['name']

    # Determine the shop's architectural archetype
    found_archetype = 'general_store'
    combined_text = (name + " " + desc).lower()
    for arch, keywords in archetype_keywords:
        if any(kw in combined_text for kw in keywords):
            found_archetype = arch
            break
    shop['archetype'] = found_archetype

    # Link categories
    eq_cats, mat_cats = category_mapping.get(found_archetype, ([], []))
    shop['equipment_categories'] = [{"index": cat.replace(".json", ""), "url": f"public/assets/atlas/equipment_categories/json/{cat}"} for cat in eq_cats]
    shop['material_categories'] = [{"index": cat.replace(".json", ""), "url": f"public/assets/atlas/materials_categories/json/{cat}"} for cat in mat_cats]

    # Reset NPC lists
    shop['day']['npcs'] = []
    shop['night']['npcs'] = []

    # Identify NPCs within the description
    npcs_found = re.findall(r'\[\[([^\]]+)\]\]', desc)
    for npc_raw in npcs_found:
        # Handle pipes [[Link|Text]]
        link_target = npc_raw.split('|')[0].strip()
        display_name = link_target

        low_name = display_name.lower()
        if (low_name and
            low_name not in non_npc_terms and
            low_name not in shop_names and
            low_name not in shop_ids and
            not display_name.isdigit() and
            len(display_name) > 2):

            # NPCs usually have capitalized names and don't contain common shop keywords
            if any(c.isupper() for c in display_name):
                # Extra check to avoid other shops/locations
                if not any(kw in low_name for kw in ['shop', 'store', 'market', 'warehouse', 'stables', 'inn', 'tavern', 'hall', 'house', 'temple', 'shrine']):
                    npc_ref = create_npc(display_name, name)
                    if npc_ref not in shop['day']['npcs']:
                        shop['day']['npcs'].append(npc_ref)
                    if npc_ref not in shop['night']['npcs']:
                        shop['night']['npcs'].append(npc_ref)

# Update the main file's timestamp
data['updatedAt'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

# Write the updated shop data back to the JSON file
with open(shops_path, 'w') as f:
    json.dump(data, f, indent=2)

print(f"Processed {len(data['sub_locations'])} shops.")
