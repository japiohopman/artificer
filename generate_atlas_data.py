import os
import json

regions_data = {
    "northwest_faerun": {
        "name": "Northwest Faerûn",
        "region": "northwest_faerun",
        "description": "Northwest Faerûn is a region of rugged wilderness, ancient forests, and powerful city-states like Waterdeep. It is often referred to as 'The North' and is known for its cold climate and untamed lands."
    },
    "north_faerun": {
        "name": "North Faerûn",
        "region": "north_faerun",
        "description": "North Faerûn encompasses the frigid reaches of the continent, including the subarctic lands of Icewind Dale and the High Ice. It is a land of harsh winters and resilient people."
    },
    "northeast_faerun": {
        "name": "Northeast Faerûn",
        "region": "northeast_faerun",
        "description": "Northeast Faerûn, also known as the Cold Lands, includes the rugged kingdoms of Damara and Vaasa, as well as the vast plains of Narfell. It is a region of ancient magic and stark beauty."
    },
    "west_faerun": {
        "name": "West Faerûn",
        "region": "west_faerun",
        "description": "West Faerûn is dominated by the Sword Coast and the Lands of Intrigue. It is a major hub of commerce and naval power, stretching from the Moonshae Isles to the borders of Calimshan."
    },
    "interior_faerun": {
        "name": "Interior Faerûn",
        "region": "interior_faerun",
        "description": "Interior Faerûn, or the Heartlands, is the cultural and political core of the continent. It contains powerful nations like Cormyr and Sembia, as well as the peaceful Dalelands."
    },
    "southeast_faerun": {
        "name": "Southeast Faerûn",
        "region": "southeast_faerun",
        "description": "Southeast Faerûn is a land of ancient empires and exotic trade. It includes the lands surrounding the Sea of Fallen Stars and the eastern reaches of the Great Rift."
    },
    "east_faerun": {
        "name": "East Faerûn",
        "region": "east_faerun",
        "description": "East Faerûn is a region of formidable magic and old rivalries, home to the Red Wizards of Thay and the coastal nation of Aglarond. It borders the vast Hordelands to the east."
    },
    "south_faerun": {
        "name": "South Faerûn",
        "region": "south_faerun",
        "description": "South Faerûn is a land of warmth and mystery, featuring the magocratic realm of Halruaa, the halfling homeland of Luiren, and the diverse Border Kingdoms along the Shining Sea."
    },
    "southwest_faerun": {
        "name": "Southwest Faerûn",
        "region": "southwest_faerun",
        "description": "Southwest Faerûn is characterized by the vast Calim Desert and the jungles of Chult. It is a region of immense wealth, ancient ruins, and dangerous wilds."
    }
}

sub_regions_data = [
    # Northwest
    ("Icewind Dales", "north_faerun", "icewind_dales", "Icewind Dale is a cold and isolated region in the far north of Faerûn, known for its ten small towns and the massive Reghed Glacier."),
    ("Waterdeep", "northwest_faerun", "waterdeep", "Waterdeep, the City of Splendors, is the most important and influential city in the North, if not all of Faerûn."),
    ("Silver Marches", "northwest_faerun", "silver_marches", "The Silver Marches, also known as Luruar, is a confederation of cities and towns in the North, centered around Silverymoon."),
    ("High Forest", "northwest_faerun", "high_forest", "The High Forest is a vast, ancient woodland that remains largely untamed, home to elves, treants, and many mysterious creatures."),
    ("Sword coast north", "northwest_faerun", "sword_coast_north", "The Sword Coast North is a rugged stretch of coastline between Waterdeep and the Spine of the World."),

    # West
    ("Evereska", "west_faerun", "evereska", "Evereska is an ancient elven stronghold hidden within a valley, one of the few remaining elven enclaves in Faerûn."),
    ("Najara", "west_faerun", "najara", "Najara, also known as the Kingdom of Snakes, is a region dominated by nagas, yuan-ti, and other reptilian creatures."),
    ("Elturgard", "west_faerun", "elturgard", "Elturgard is a righteous land governed by paladins, with the city of Elturel as its capital, formerly illuminated by the second sun, the Companion."),
    ("Amn", "west_faerun", "amn", "Amn is a wealthy merchant nation known as the Merchant’s Realm, where trade and coin are the ultimate powers."),
    ("Tethyr", "west_faerun", "tethyr", "Tethyr is a kingdom of knights and nobles that has recently emerged from a long period of civil war and instability."),
    ("sword coast south", "west_faerun", "swort_coast_south", "The Sword Coast South is the coastal region south of the Cloud Peaks, stretching towards the lands of Calimshan."),
    ("Moonshae Isles", "west_faerun", "moonshae_isles", "The Moonshae Isles are a rugged archipelago west of the Sword Coast, home to the Ffolk and the Northlanders."),
    ("Alaron", "west_faerun", "alaron", "Alaron is the largest and most populous island of the Moonshae Isles, home to the High King."),
    ("Gwynneth", "west_faerun", "gwynneth", "Gwynneth is a mystical island in the Moonshaes, now largely reclaimed by the fey and the forces of Sarifal."),
    ("Norland", "west_faerun", "norland", "Norland is an island in the Moonshae archipelago inhabited primarily by Northlanders."),
    ("Oman", "west_faerun", "oman", "Oman is a cold, rugged island in the Moonshae Isles, often plagued by giants."),
    ("Snowdown", "west_faerun", "snowdown", "Snowdown is the southernmost of the major Moonshae Isles, heavily influenced by Amnian interests."),
    ("Evermeet", "west_faerun", "evermeet", "Evermeet, the Island of Elves, is the final retreat for the elven people of Faerûn, located far across the Sea of Swords."),

    # Interior
    ("Cormyr", "interior_faerun", "cormyr", "Cormyr, the Forest Kingdom, is a powerful and stable nation known for its noble knights and the Purple Dragons."),
    ("Sembia", "interior_faerun", "sembia", "Sembia is a land of ambitious merchants and burgeoning trade, often acting as a rival to Cormyr."),
    ("Dalelands", "interior_faerun", "dalelands", "The Dalelands are a collection of independent dales located around the Cormanthor forest, known for their fierce independence."),
    ("Turmish", "interior_faerun", "turmish", "Turmish is a prosperous and peaceful merchant nation located on the southern shores of the Sea of Fallen Stars."),
    ("Hlondeth", "interior_faerun", "hlondeth", "Hlondeth is a city-state on the Vilhon Reach, ruled by the yuan-ti Extaminos family."),
    ("Akanûl", "interior_faerun", "akanul", "Akanûl is a realm of genasi that was transported from Abeir to Toril during the Spellplague."),
    ("Chessenta", "interior_faerun", "chessenta", "Chessenta is a collection of competitive city-states known for their love of philosophy, athletics, and war."),
    ("Sespech", "interior_faerun", "sespech", "Sespech is an independent barony in the Vilhon Reach that has resisted the influence of the Rundeen."),

    # Northeast
    ("Damara", "northeast_faerun", "damara", "Damara is a rugged northern kingdom known for its iron mines and its history of war with the Witch-King of Vaasa."),
    ("Narfell", "northeast_faerun", "narfell", "Narfell is a cold, windswept land of nomadic tribes, built on the ruins of an ancient demon-summoning empire."),
    ("Great Dale", "northeast_faerun", "great_dale", "The Great Dale is a vast, sparsely populated region of forests and plains between the Demonlands and Rashemen."),
    ("Impiltur", "northeast_faerun", "impiltur", "Impiltur is a kingdom of trade and piety located on the northern shores of the Sea of Fallen Stars."),
    ("Rashemen", "northeast_faerun", "rashemen", "Rashemen is a wild and magical land known for its berserkers and the mysterious Witches of Rashemen."),
    ("Thesk", "northeast_faerun", "thesk", "Thesk is a land of merchants and caravan routes, often serving as the gateway between Faerûn and the East."),

    # East
    ("Aglarond", "east_faerun", "aglarond", "Aglarond is a coastal kingdom of sorcerers and rangers, long served as a bulwark against the expansion of Thay."),
    ("Thay", "east_faerun", "thay", "Thay is a formidable magocracy ruled by the Red Wizards and their lich-lord, Szass Tam."),
    ("Vesperin", "east_faerun", "vesperin", "Vesperin is a center for trade in the region of The Vast, where gold and commerce dominate society."),
    ("Murghôm", "east_faerun", "murghom", "Murghôm is a land of farmers and horsemen located between the Sea of Fallen Stars and the Hordelands."),

    # Southeast
    ("Shining Lands", "southeast_faerun", "shining_lands", "The Shining Lands include the wealthy trade nations of Durpar, Estagund, and Var the Golden."),
    ("Mulhorand", "southeast_faerun", "mulhorand", "Mulhorand is an ancient empire where the gods themselves once walked, now reclaimed by its people from the Imaskari."),
    ("Unther", "southeast_faerun", "unther", "Unther is an ancient land once ruled by god-kings, recently reborn after the chaos of the Spellplague."),
    ("Tymanther", "southeast_faerun", "tymanther", "Tymanther is the kingdom of the dragonborn, brought to Toril from Abeir and established on the ruins of Unther."),

    # South
    ("Border Kingdoms", "south_faerun", "border_kingdoms", "The Border Kingdoms are a collection of small, ever-changing realms founded by adventurers and exiles along the Shining Sea."),
    ("Halruaa", "south_faerun", "halruaa", "Halruaa is a reclusive magocracy known for its wizard-lords and skyship-filled skies."),
    ("Dambrath", "south_faerun", "dambrath", "Dambrath is a land of plains and horsemen, formerly ruled by drow-worshiping priestesses."),
    ("Luiren", "south_faerun", "luiren", "Luiren is the ancestral homeland of the halflings, a land of rolling hills and fertile fields."),

    # Southwest
    ("Calimshan", "southwest_faerun", "calimshan", "Calimshan is an ancient and wealthy desert land, dominated by the influence of genies and vast merchant houses."),
    ("Thindol", "southwest_faerun", "thindol", "Thindol is a peninsula in the south inhabited by both humans and yuan-ti."),
    ("Samarach", "southwest_faerun", "samarach", "Samarach is a hidden kingdom on the Chultan Peninsula, known for its illusions and mystery."),
    ("Tashalar", "southwest_faerun", "tashalar", "Tashalar is a wealthy coastal land known for its exotic spices, fine ships, and skilled crossbowmen."),
    ("Lantan", "southwest_faerun", "lantan", "Lantan is an island nation of gnomes known for their incredible technological advancements and clockwork inventions.")
]

base_path = "public/assets/atlas/world/toril/faerun"
regions_dir = os.path.join(base_path, "regions")
sub_regions_dir = os.path.join(base_path, "sub_regions")

os.makedirs(regions_dir, exist_ok=True)
os.makedirs(sub_regions_dir, exist_ok=True)

# Create Regions
for slug, data in regions_data.items():
    region_path = os.path.join(regions_dir, slug)
    os.makedirs(region_path, exist_ok=True)

    # Per user request: west_fearun.json typo for west_faerun
    filename = slug.replace("faerun", "fearun") + ".json"
    filepath = os.path.join(region_path, filename)

    json_content = {
        "id": slug,
        "name": data["name"],
        "world": "totil",
        "continent": "fearun",
        "region": data["region"],
        "description": data["description"]
    }

    with open(filepath, "w") as f:
        json.dump(json_content, f, indent=2)
        f.write("\n")

# Create Sub-Regions
for name, region_slug, slug, description in sub_regions_data:
    sub_region_path = os.path.join(sub_regions_dir, slug)
    os.makedirs(sub_region_path, exist_ok=True)

    filepath = os.path.join(sub_region_path, slug + ".json")

    json_content = {
        "id": slug,
        "name": name,
        "world": "totil",
        "continent": "fearun",
        "region": region_slug,
        "sub_region": slug,
        "description": description
    }

    with open(filepath, "w") as f:
        json.dump(json_content, f, indent=2)
        f.write("\n")

print(f"Generated {len(regions_data)} regions and {len(sub_regions_data)} sub-regions.")
