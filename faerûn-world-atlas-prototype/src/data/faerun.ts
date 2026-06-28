import { FaerunData } from "../types";

export const FAERUN_DATA: FaerunData = {
    "mapImage": "Faerun_day.webp",
    "coordinateOrder": "xy",
    "mapBounds": [
        [0, 0],
        [4763, 3185]
    ],
    "origin": "bottom-left",
    "categories": [
        { "id": "cities", "listId": 1, "name": "Cities", "color": "#f00", "symbol": "", "symbolColor": "", "icon": "File:City icon.svg" },
        { "id": "towns_settlements", "listId": 2, "name": "Towns & Settlements", "color": "#ff6a6a", "symbol": "", "symbolColor": "", "icon": "File:Hamlet icon.svg" },
        { "id": "fortresses_keeps", "listId": 3, "name": "Fortresses & Keeps", "color": "#fa5200", "symbol": "", "symbolColor": "", "icon": "File:Keeps strongholds icon.svg" },
        { "id": "ruins", "listId": 4, "name": "Ruins", "color": "#656565", "symbol": "", "symbolColor": "", "icon": "File:Ruins icon.svg" },
        { "id": "poi", "listId": 5, "name": "Points of Interest", "color": "#ffffff", "symbol": "", "symbolColor": "", "icon": "File:Black elminster icon.svg" },
        { "id": "hills_mountains", "listId": 6, "name": "Hills & Mountains", "color": "#ff9900", "symbol": "", "symbolColor": "", "icon": "File:Mountains icon.svg" },
        { "id": "peaks_cliffs", "listId": 7, "name": "Peaks & Cliffs", "color": "#c39560", "symbol": "", "symbolColor": "", "icon": "File:Peaks icon.svg" },
        { "id": "forests", "listId": 8, "name": "Forests", "color": "#00921c", "symbol": "", "symbolColor": "", "icon": "File:Forest icon.svg" },
        { "id": "water", "listId": 9, "name": "Bodies of Water", "color": "#00e8fa", "symbol": "", "symbolColor": "", "icon": "File:Bodies of water icon.svg" },
        { "id": "wetlands", "listId": 10, "name": "Wetlands", "color": "#6882f2", "symbol": "", "symbolColor": "", "icon": "File:Swamp icon.svg" },
        { "id": "islands", "listId": 11, "name": "Islands", "color": "#050065", "symbol": "", "symbolColor": "", "icon": "File:Islands icon.svg" },
        { "id": "deserts_wastelands", "listId": 12, "name": "Deserts & Wastelands", "color": "#f5fa00", "symbol": "", "symbolColor": "", "icon": "File:Desert icon.svg" },
        { "id": "plains_grasslands", "listId": 13, "name": "Plains & Grasslands", "color": "#ced900", "symbol": "", "symbolColor": "", "icon": "File:Farms icon.svg" },
        { "id": "glaciers_tundras", "listId": 14, "name": "Glaciers & Tundras", "color": "#b3fffd", "symbol": "", "symbolColor": "", "icon": "File:Tundra icon.svg" },
        { "id": "oases", "listId": 15, "name": "Oases", "color": "#edffa7", "symbol": "", "symbolColor": "", "icon": "File:Oasis icon.svg" },
        { "id": "roads_trails", "listId": 16, "name": "Roads & Trails", "color": "#2e2703", "symbol": "", "symbolColor": "", "icon": "File:Mountain road icon.svg" },
        { "id": "references", "listId": 17, "name": "References", "color": "#000000", "symbol": "", "symbolColor": "" }
    ],
    "markers": [
        {
            "id": "western_heartlands_marker",
            "position": [3100, 1600],
            "categoryId": "references",
            "region": "west_faerun_sword_coast",
            "subRegion": "western_heartlands",
            "popup": { "title": "Western Heartlands", "description": "Independent city-states and untamed wilderness." }
        },
        {
            "id": "lands_of_intrigue_marker",
            "position": [3000, 800],
            "categoryId": "references",
            "region": "west_faerun_sword_coast",
            "subRegion": "lands_of_intrigue",
            "popup": { "title": "Lands of Intrigue", "description": "The kingdoms of Amn, Tethyr, and Calimshan." }
        },
        {
            "id": "moonshae_isles_marker",
            "position": [400, 1200],
            "categoryId": "references",
            "region": "west_faerun_sword_coast",
            "subRegion": "moonshae_isles",
            "subMapId": "moonshae_isles_map",
            "popup": { "title": "Moonshae Isles", "description": "Archipelago of cold, rocky isles." }
        },
        {
            "id": "alaron_island",
            "position": [420, 1150],
            "categoryId": "islands",
            "region": "west_faerun_sword_coast",
            "subRegion": "moonshae_isles",
            "popup": { "title": "Alaron", "description": "The largest and most populated of the Moonshae Isles." }
        },
        {
            "id": "gwynneth_island",
            "position": [350, 1100],
            "categoryId": "islands",
            "region": "west_faerun_sword_coast",
            "subRegion": "moonshae_isles",
            "popup": { "title": "Gwynneth", "description": "Home to myriad fey creatures." }
        },
        {
            "id": "island_kingdoms_marker",
            "position": [150, 1500],
            "categoryId": "references",
            "region": "west_faerun_sword_coast",
            "subRegion": "island_kingdoms",
            "popup": { "title": "Island Kingdoms", "description": "Independent islands in the Sea of Swords." }
        },
        {
            "id": "evermeet_island",
            "position": [100, 1400],
            "categoryId": "islands",
            "region": "west_faerun_sword_coast",
            "subRegion": "island_kingdoms",
            "popup": { "title": "Evermeet", "description": "The sacred island kingdom of the elves." }
        },
        {
            "id": "anauroch_marker",
            "position": [2500, 2400],
            "categoryId": "references",
            "region": "north_faerun",
            "subRegion": "anauroch",
            "popup": { "title": "Anauroch", "description": "The Great Desert, heart of ancient Netheril." }
        },
        {
            "id": "shadowdale_marker",
            "position": [3100, 1950],
            "categoryId": "references",
            "region": "north_faerun",
            "subRegion": "eastern_heartlands",
            "location": "dalelands",
            "popup": { "title": "Shadowdale", "description": "Iconic home of Elminster in the Dalelands." }
        },
        {
            "id": "zhentil_keep_marker",
            "position": [3300, 2250],
            "categoryId": "references",
            "region": "north_faerun",
            "subRegion": "eastern_heartlands",
            "location": "moonsea",
            "popup": { "title": "Zhentil Keep", "description": "The primary power on the Moonsea." }
        },
        {
            "id": "tantras_marker",
            "position": [3600, 1850],
            "categoryId": "references",
            "region": "north_faerun",
            "subRegion": "the_vast",
            "popup": { "title": "Tantras", "description": "Major port city in The Vast." }
        },
        {
            "id": "vaasa_marker",
            "position": [3800, 2650],
            "categoryId": "references",
            "region": "north_faerun",
            "subRegion": "moonsea_north",
            "location": "vaasa",
            "popup": { "title": "Vaasa", "description": "Frozen wasteland of the Lich-King." }
        },
        {
            "id": "suzail_marker",
            "position": [2850, 1650],
            "categoryId": "references",
            "region": "interior_faerun",
            "subRegion": "cormyr",
            "popup": { "title": "Suzail", "description": "The royal capital of Cormyr, a jewel of the Inner Sea." }
        },
        {
            "id": "ordulin_marker",
            "position": [3300, 1750],
            "categoryId": "references",
            "region": "interior_faerun",
            "subRegion": "sembia",
            "popup": { "title": "Ordulin", "description": "The capital city of Sembia, center of trade and intrigue." }
        },
        {
            "id": "westgate_marker",
            "position": [2950, 1500],
            "categoryId": "references",
            "region": "interior_faerun",
            "subRegion": "dragon_coast",
            "popup": { "title": "Westgate", "description": "A lawless metropolis where everything and everyone has a price." }
        },
        {
            "id": "immrilmar_marker",
            "position": [3350, 1550],
            "categoryId": "references",
            "region": "interior_faerun",
            "subRegion": "pirate_isles",
            "popup": { "title": "Immrilmar", "description": "The largest settlement in the Pirate Isles." }
        },
        {
            "id": "arrabar_marker",
            "position": [3750, 1050],
            "categoryId": "references",
            "region": "interior_faerun",
            "subRegion": "vilhon_reach",
            "location": "chondath",
            "popup": { "title": "Arrabar", "description": "The bustling capital of Chondath on the Vilhon Reach." }
        },
        {
            "id": "port_nyanzaru_marker",
            "position": [1600, 450],
            "categoryId": "references",
            "region": "southwest_faerun",
            "subRegion": "chult",
            "popup": { "title": "Port Nyanzaru", "description": "The major trading port and gateway to the jungles of Chult." }
        },
        {
            "id": "tashluta_marker",
            "position": [1950, 650],
            "categoryId": "references",
            "region": "southwest_faerun",
            "subRegion": "tashalar",
            "popup": { "title": "Tashluta", "description": "Capital of Tashalar, known for its exotic spices and shipyards." }
        },
        {
            "id": "lushpool_marker",
            "position": [2200, 750],
            "categoryId": "references",
            "region": "southwest_faerun",
            "subRegion": "lapaliiya",
            "popup": { "title": "Lushpool", "description": "A wealthy port city of the Lapaliiya confederation." }
        },
        {
            "id": "samargol_marker",
            "position": [1800, 350],
            "categoryId": "references",
            "region": "southwest_faerun",
            "subRegion": "samarach",
            "popup": { "title": "Samargol", "description": "The capital of the secretive kingdom of Samarach." }
        },
        {
            "id": "thandar_marker",
            "position": [2150, 400],
            "categoryId": "references",
            "region": "southwest_faerun",
            "subRegion": "thindol",
            "popup": { "title": "Thandar", "description": "A coastal settlement in the southern reaches of Thindol." }
        },
        {
            "id": "shaar_marker",
            "position": [3300, 700],
            "categoryId": "references",
            "region": "southeast_faerun",
            "subRegion": "shaar",
            "popup": { "title": "The Shaar", "description": "Vast, rolling grasslands of the south." }
        },
        {
            "id": "halruaa_marker",
            "position": [2750, 400],
            "categoryId": "references",
            "region": "southeast_faerun",
            "subRegion": "halruaa",
            "popup": { "title": "Halarahh", "description": "Capital of the wizard-ruled nation of Halruaa." }
        },
        {
            "id": "dambrath_marker",
            "position": [3100, 450],
            "categoryId": "references",
            "region": "southeast_faerun",
            "subRegion": "dambrath",
            "popup": { "title": "Cathyr", "description": "The capital of the horse-lords of Dambrath." }
        },
        {
            "id": "luiren_marker",
            "position": [3600, 400],
            "categoryId": "references",
            "region": "southeast_faerun",
            "subRegion": "luiren",
            "popup": { "title": "Beluir", "description": "The largest city and spiritual heart of Luiren." }
        },
        {
            "id": "durpar_marker",
            "position": [4400, 550],
            "categoryId": "references",
            "region": "southeast_faerun",
            "subRegion": "durpar",
            "popup": { "title": "Vaelen", "description": "A major trading hub in the merchant kingdom of Durpar." }
        },
        {
            "id": "bezentil_marker",
            "position": [4200, 1950],
            "categoryId": "references",
            "region": "east_faerun",
            "subRegion": "thay",
            "popup": { "title": "Bezentil", "description": "A major city in the magocracy of Thay." }
        },
        {
            "id": "skuld_marker",
            "position": [4300, 1450],
            "categoryId": "references",
            "region": "east_faerun",
            "subRegion": "mulhorand",
            "popup": { "title": "Skuld", "description": "The ancient, pyramid-filled capital of Mulhorand." }
        },
        {
            "id": "messemprar_marker",
            "position": [4100, 1650],
            "categoryId": "references",
            "region": "east_faerun",
            "subRegion": "unther",
            "popup": { "title": "Messemprar", "description": "A major merchant city in the ancient land of Unther." }
        },
        {
            "id": "cimbar_marker",
            "position": [3750, 1450],
            "categoryId": "references",
            "region": "east_faerun",
            "subRegion": "chessenta",
            "popup": { "title": "Cimbar", "description": "The traditional capital and cultural heart of Chessenta." }
        },
        {
            "id": "velprintalar_marker",
            "position": [4100, 2050],
            "categoryId": "references",
            "region": "east_faerun",
            "subRegion": "aglarond",
            "popup": { "title": "Velprintalar", "description": "The bustling capital city of Aglarond." }
        },
        {
            "id": "phontane_marker",
            "position": [4100, 2250],
            "categoryId": "references",
            "region": "east_faerun",
            "subRegion": "thesk",
            "popup": { "title": "Phontane", "description": "A vital port city at the end of the Golden Way in Thesk." }
        },
        {
            "id": "derlusk_marker",
            "position": [2450, 1050],
            "categoryId": "references",
            "region": "south_faerun",
            "subRegion": "border_kingdoms",
            "popup": { "title": "Derlusk", "description": "The major port city and center of the Border Kingdoms." }
        },
        {
            "id": "ankhapur_marker",
            "position": [2350, 1150],
            "categoryId": "references",
            "region": "south_faerun",
            "subRegion": "lake_of_steam",
            "popup": { "title": "Ankhapur", "description": "A powerful city-state on the northern shore of the Lake of Steam." }
        },
        {
            "id": "innarlith_marker",
            "position": [2600, 1200],
            "categoryId": "references",
            "region": "south_faerun",
            "subRegion": "lake_of_steam",
            "popup": { "title": "Innarlith", "description": "A wealthy port city known for its hot springs and central location on the lake." }
        },
        {
            "id": "border_kingdoms_general",
            "position": [2422, 487],
            "categoryId": "references",
            "region": "south_faerun",
            "subRegion": "border_kingdoms",
            "popup": { "title": "Border Kingdoms", "description": "Small, unstable realms on the southern shore of the Lake of Steam." }
        },
        {
            "id": "shining_south_general",
            "position": [3422, 387],
            "categoryId": "references",
            "region": "south_faerun",
            "subRegion": "shining_south",
            "popup": { "title": "Shining South", "description": "Wealthy and exotic kingdoms along the Great Sea including Halruaa and Luiren." }
        }
    ]
};
