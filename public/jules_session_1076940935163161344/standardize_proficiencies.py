import os
import json
from datetime import datetime

# Path to the proficiencies directory
prof_dir = "public/assets/atlas/proficiencies/json/"

# Mapping for ability score indices
ability_map = {
    "str": "strength",
    "dex": "dexterity",
    "con": "constitution",
    "int": "intelligence",
    "wis": "wisdom",
    "cha": "charisma"
}

# Mapping for types to slugs
type_map = {
    "Armor": "armor",
    "Artisan's Tools": "artisans_tools",
    "Gaming Sets": "gaming_sets",
    "Musical Instruments": "musical_instruments",
    "Other": "other",
    "Saving Throws": "saving_throws",
    "Skills": "skills",
    "Vehicles": "vehicles",
    "Weapons": "weapons"
}

def update_url(url):
    if not url:
        return url
    
    # Ensure public/ prefix
    if not url.startswith("public/"):
        url = "public/" + url.lstrip("/")
    
    # Fix classes -> class/json
    url = url.replace("public/assets/atlas/classes/", "public/assets/atlas/class/json/")
    if "public/assets/atlas/class/json/" in url and not url.endswith(".json"):
        url += ".json"
    
    # Fix subraces -> subraces/json
    url = url.replace("public/assets/atlas/subraces/", "public/assets/atlas/subraces/json/")
    if "public/assets/atlas/subraces/json/" in url and not url.endswith(".json"):
        url += ".json"
    
    # Fix species -> species/json (if any)
    url = url.replace("public/assets/atlas/species/", "public/assets/atlas/species/json/")
    if "public/assets/atlas/species/json/" in url and not url.endswith(".json"):
        url += ".json"

    # For references, ensure /json/ and .json
    # Examples:
    # public/assets/atlas/equipment/longsword -> public/assets/atlas/equipment/json/longsword.json
    # public/assets/atlas/equipment_categories/simple_weapons -> public/assets/atlas/equipment_categories/json/simple_weapons.json
    # public/assets/atlas/skills/acrobatics -> public/assets/atlas/skills/json/acrobatics.json
    # public/assets/atlas/ability_scores/strength -> public/assets/atlas/ability_scores/json/strength.json
    
    categories = ["equipment", "equipment_categories", "skills", "ability_scores", "proficiencies"]
    for cat in categories:
        cat_path = f"public/assets/atlas/{cat}/"
        if url.startswith(cat_path) and "/json/" not in url:
            rel_path = url[len(cat_path):]
            if not rel_path.endswith(".json"):
                url = f"public/assets/atlas/{cat}/json/{rel_path}.json"
            else:
                url = f"public/assets/atlas/{cat}/json/{rel_path}"

    if not url.endswith(".json") and "proficiencies/json/" in url:
         url += ".json"

    return url

timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")

for filename in os.listdir(prof_dir):
    if filename.endswith(".json"):
        filepath = os.path.join(prof_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 1. Rename races to species
        if "races" in data:
            data["species"] = data.pop("races")
        else:
            data["species"] = []

        # 2. Update classes URLs
        for cls in data.get("classes", []):
            cls["url"] = update_url(cls["url"])

        # 3. Update species URLs
        for sp in data.get("species", []):
            sp["url"] = update_url(sp["url"])

        # 4. Update url field
        data["url"] = update_url(data["url"])

        # 5. Update reference
        if "reference" in data:
            ref = data["reference"]
            # Update index if it's an ability score
            if ref["index"] in ability_map:
                ref["index"] = ability_map[ref["index"]]
                ref["name"] = ref["index"]
            
            ref["url"] = update_url(ref["url"])
            
            # Determine reference_category
            ref_url = ref["url"]
            ref_cat = "unknown"
            if "equipment_categories/json/" in ref_url:
                ref_cat = "equipment_categories"
            elif "equipment/json/" in ref_url:
                ref_cat = "equipment"
            elif "skills/json/" in ref_url:
                ref_cat = "skills"
            elif "ability_scores/json/" in ref_url:
                ref_cat = "ability_scores"
            
            data["proficiency_specific"] = {
                "reference_category": ref_cat
            }

        # 6. Slugify type
        orig_type = data.get("type")
        if orig_type in type_map:
            data["type"] = type_map[orig_type]

        # 7. Update image path
        if "image" in data:
            img = data["image"]
            if not img.startswith("public/"):
                img = "public/" + img.lstrip("/")
            data["image"] = img

        # 8. Update updated_at
        data["updated_at"] = timestamp

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            f.write('\n')

print("Update complete.")
