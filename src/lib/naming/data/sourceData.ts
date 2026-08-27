/**
 * Source Naming Data
 * Canonically structured naming pools derived directly from official source material
 * and clearly separated from project-authored extension pools.
 */

export interface SourceNamePool {
  maleGiven?: readonly string[];
  femaleGiven?: readonly string[];
  childGiven?: readonly string[];
  unisexGiven?: readonly string[];
  virtueNames?: readonly string[];
  clanNames?: readonly string[];
  familyNames?: readonly string[];
  surnames?: readonly string[];
  childhoodNames?: readonly string[];
  nicknames?: readonly string[];
}

export interface SourceNamingCatalog {
  /** Source-derived species naming pools (PHB / official D&D source material) */
  tiefling: SourceNamePool;
  gnome: SourceNamePool;
  dragonborn: SourceNamePool;
  elf: SourceNamePool;
  dwarf: SourceNamePool;
  halfling: SourceNamePool;
  halfOrc: SourceNamePool;
  /** Regional human ethnic naming pools derived from official source material + neutral fallback */
  human: Record<string, SourceNamePool>;
  /** Explicit project-authored fallback and generic extension pools (NOT presented as official D&D source material) */
  projectExtensions?: Record<string, SourceNamePool>;
}

/**
 * Official source-derived name lists from D&D 5e source material.
 * Categorized strictly by origin and semantic domain.
 */
export const SOURCE_NAMING_DATA: SourceNamingCatalog = {
  // --- 1. Tiefling (Source-derived: PHB Ch. 2) ---
  tiefling: {
    maleGiven: [
      'Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados',
      'Kairon', 'Leucis', 'Melech', 'Mordai', 'Morthos', 'Pelaios',
      'Skamos', 'Therai'
    ],
    femaleGiven: [
      'Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Ea',
      'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Phelaia', 'Rieta'
    ],
    virtueNames: [
      'Art', 'Carrion', 'Chant', 'Creed', 'Despair', 'Excellence', 'Fear',
      'Glory', 'Hope', 'Ideal', 'Music', 'Nowhere', 'Open', 'Poetry',
      'Quest', 'Random', 'Reverence', 'Sorrow', 'Temerity', 'Torment', 'Weary'
    ]
  },

  // --- 2. Gnome (Source-derived: PHB Ch. 2) ---
  gnome: {
    maleGiven: [
      'Alston', 'Alvyn', 'Boddynock', 'Brocc', 'Burgell', 'Dimble',
      'Eldon', 'Erky', 'Fonkin', 'Frug', 'Gerbo', 'Gimble',
      'Glim', 'Jebeddo', 'Kellen', 'Namfoodle', 'Orryn', 'Roondar',
      'Seebo', 'Sindri', 'Warryn', 'Wrenn', 'Zook'
    ],
    femaleGiven: [
      'Bimpnollin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Duvamil',
      'Ella', 'Ellyjobell', 'Ellywick', 'Lilli', 'Loopmottin', 'Lorilla',
      'Mardnab', 'Nissa', 'Nyx', 'Oda', 'Orla', 'Roywyn', 'Shamil',
      'Tana', 'Waywocket', 'Zanna'
    ],
    clanNames: [
      'Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig',
      'Ningel', 'Raulnor', 'Scheppen', 'Timbers', 'Turen'
    ],
    nicknames: [
      'Aleslosh', 'Ashhearth', 'Badger', 'Cloak', 'Doublelock', 'Filchbatter',
      'Fnipper', 'Ku', 'Nim', 'Oneshoe', 'Pock', 'Sparklegem', 'Stumbleduck'
    ]
  },

  // --- 3. Dragonborn (Source-derived: PHB Ch. 2) ---
  dragonborn: {
    maleGiven: [
      'Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan',
      'Kriv', 'Medrash', 'Mehen', 'Nadarr', 'Pandjed', 'Patrin',
      'Rhogar', 'Shamash', 'Shedinn', 'Tarhun', 'Torinn'
    ],
    femaleGiven: [
      'Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Havilar',
      'Jheri', 'Kava', 'Korinn', 'Mishann', 'Nala', 'Perra',
      'Raiann', 'Sora', 'Surina', 'Thava', 'Uadjit'
    ],
    childhoodNames: [
      'Climber', 'Earbender', 'Leaper', 'Pious', 'Shieldbiter', 'Zealous'
    ],
    clanNames: [
      'Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion',
      'Fenkenkabradon', 'Kepeshkmolik', 'Kerrhylon', 'Kimbatuul',
      'Linxakasendalor', 'Myastan', 'Nemmonis', 'Norixius',
      'Ophinshtalajiir', 'Prexijandilin', 'Shestendeliath', 'Turnuroth',
      'Verthisathurgiesh', 'Yarjerit'
    ]
  },

  // --- 4. Elf (Source-derived: PHB Ch. 2) ---
  elf: {
    childGiven: [
      'Ara', 'Bryn', 'Del', 'Eryn', 'Faen', 'Innil',
      'Lael', 'Mella', 'Naill', 'Naeris', 'Phann', 'Rael',
      'Rinn', 'Sai', 'Syllin', 'Thia', 'Vali'
    ],
    maleGiven: [
      'Adran', 'Aelar', 'Aramil', 'Arannis', 'Aust', 'Beiro',
      'Berrian', 'Carrie', 'Enialis', 'Erdan', 'Erevan', 'Galinndan',
      'Hadarai', 'Heian', 'Himo', 'Immeral', 'Ivellios', 'Laucian',
      'Mindartis', 'Paelias', 'Peren', 'Quarion', 'Riardon', 'Rolen',
      'Soveliss', 'Thamior', 'Tharivol', 'Theren', 'Varis'
    ],
    femaleGiven: [
      'Adrie', 'Althaea', 'Anastrianna', 'Andraste', 'Antinua', 'Bethrynna',
      'Birel', 'Caelynn', 'Dara', 'Enna', 'Felosial', 'Ielenia',
      'Jelenneth', 'Keyleth', 'Leshanna', 'Lia', 'Meriele', 'Mialee',
      'Naivara', 'Quelenna', 'Sariel', 'Shanairra', 'Shava', 'Thalia', 'Vadania'
    ],
    familyNames: [
      'Amakiir', 'Amastacia', 'Galanodel', 'Holimion', 'Ilphelkiir',
      'Liadon', 'Meliamne', 'Nailo', 'Siannodel', 'Xiloscient'
    ]
  },

  // --- 5. Dwarf (Source-derived: PHB Ch. 2) ---
  dwarf: {
    maleGiven: [
      'Adrik', 'Alberich', 'Baern', 'Barendd', 'Brottor', 'Bruenor',
      'Dain', 'Darrak', 'Delg', 'Eberk', 'Einkil', 'Fargrim',
      'Flint', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik',
      'Oskar', 'Rangrim', 'Rurik', 'Taklinn', 'Thoradin', 'Thorin',
      'Tordek', 'Traubon', 'Travok', 'Ulfgar', 'Veit', 'Vondal'
    ],
    femaleGiven: [
      'Amber', 'Artin', 'Audhild', 'Bardryn', 'Dagnal', 'Diesa',
      'Eldeth', 'Falkrunn', 'Finellen', 'Gunnloda', 'Gurdis', 'Helja',
      'Hlin', 'Kathra', 'Kristryd', 'Ilde', 'Liftrasa', 'Mardred',
      'Riswynn', 'Sanni', 'Torbera', 'Torgga', 'Vistra'
    ],
    clanNames: [
      'Balderk', 'Battlehammer', 'Brawnanvil', 'Dankil', 'Fireforge',
      'Frostbeard', 'Gorunn', 'Holderhek', 'Ironfist', 'Loderr',
      'Lutgehr', 'Rumnaheim', 'Strakeln', 'Torunn', 'Ungart'
    ]
  },

  // --- 6. Halfling (Source-derived: PHB Ch. 2) ---
  halfling: {
    maleGiven: [
      'Alton', 'Ander', 'Cade', 'Corrin', 'Eldon', 'Errich',
      'Finnan', 'Garret', 'Lindal', 'Lyle', 'Merric', 'Milo',
      'Osborn', 'Perrin', 'Reed', 'Roscoe', 'Wellby'
    ],
    femaleGiven: [
      'Andry', 'Bree', 'Callie', 'Cora', 'Euphemia', 'Jillian',
      'Kithri', 'Lavinia', 'Lidda', 'Merla', 'Nedda', 'Paela',
      'Portia', 'Seraphina', 'Shaena', 'Trym', 'Vani', 'Verna'
    ],
    familyNames: [
      'Brushgather', 'Goodbarrel', 'Greenbottle', 'High-hill', 'Hilltopple',
      'Leagallow', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough'
    ]
  },

  // --- 7. Half-Orc (Source-derived: PHB Ch. 2) ---
  halfOrc: {
    maleGiven: [
      'Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh',
      'Keth', 'Krusk', 'Mhurren', 'Ront', 'Shump', 'Thokk'
    ],
    femaleGiven: [
      'Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega',
      'Ovak', 'Ownka', 'Shautha', 'Sulha', 'Vola', 'Volen', 'Yevelda'
    ]
  },

  // --- 8. Human Regional Ethnicities (Source-derived: PHB Ch. 2) + Project Neutral ---
  human: {
    calishite: {
      maleGiven: ['Aseir', 'Bardeid', 'Haseid', 'Khemed', 'Mehmen', 'Sudeiman', 'Zasheir'],
      femaleGiven: ['Alala', 'Ceidil', 'Hama', 'Jasmal', 'Meilil', 'Seipora', 'Yasheira', 'Zasheida'],
      surnames: ['Basha', 'Dumein', 'Jassan', 'Khalid', 'Mostana', 'Pashar', 'Rein']
    },
    chondathan: {
      maleGiven: ['Darvin', 'Dorn', 'Evendur', 'Gorstag', 'Grim', 'Helm', 'Malark', 'Morn', 'Randal', 'Stedd'],
      femaleGiven: ['Arveene', 'Esvele', 'Jhessail', 'Kerri', 'Lureene', 'Miri', 'Rowan', 'Shandri', 'Tessele'],
      surnames: ['Amblecrown', 'Buckman', 'Dundragon', 'Evenwood', 'Greycastle', 'Tallstag']
    },
    damaran: {
      maleGiven: ['Bor', 'Fadei', 'Glar', 'Grigor', 'Igan', 'Ivor', 'Kosef', 'Mival', 'Orei', 'Pavel', 'Sergor'],
      femaleGiven: ['Alethra', 'Kara', 'Katernin', 'Mara', 'Natali', 'Olma', 'Tana', 'Zora'],
      surnames: ['Bersk', 'Chernin', 'Dotsk', 'Kulenov', 'Marsk', 'Nemetsk', 'Shemov', 'Starag']
    },
    illuskan: {
      maleGiven: ['Ander', 'Blath', 'Bran', 'Frath', 'Geth', 'Lander', 'Luth', 'Malcer', 'Stor', 'Taman', 'Urth'],
      femaleGiven: ['Amafrey', 'Betha', 'Cefrey', 'Kethra', 'Mara', 'Olga', 'Silifrey', 'Westra'],
      surnames: ['Brightwood', 'Helder', 'Hornraven', 'Lackman', 'Stormwind', 'Windrivver']
    },
    mulan: {
      maleGiven: ['Aoth', 'Bareris', 'Ehput-Ki', 'Kethoth', 'Mumed', 'Ramas', 'So-Kehur', 'Thazar-De', 'Urhur'],
      femaleGiven: ['Arizima', 'Chathi', 'Nephis', 'Nulara', 'Murithi', 'Sefris', 'Thola', 'Umara', 'Zolis'],
      surnames: ['Ankhalab', 'Anskuld', 'Fezim', 'Hahpet', 'Nathandem', 'Sepret', 'Uuthrakt']
    },
    rashemi: {
      maleGiven: ['Borivik', 'Faurgar', 'Jandar', 'Kanithar', 'Madislak', 'Ralmevik', 'Shaumar', 'Vladislak'],
      femaleGiven: ['Fyevarra', 'Hulmarra', 'Immith', 'Imzel', 'Navarra', 'Shevarra', 'Tammith', 'Yuldra'],
      surnames: ['Chergoba', 'Dyernina', 'Ilttazyara', 'Murnyethara', 'Stayanoga', 'Ulmokin']
    },
    shou: {
      maleGiven: ['An', 'Chen', 'Chi', 'Fai', 'Jiang', 'Jun', 'Lian', 'Long', 'Meng', 'On', 'Shan', 'Shui', 'Wen'],
      femaleGiven: ['Bai', 'Chao', 'Jia', 'Lei', 'Mei', 'Qiao', 'Shui', 'Tai'],
      surnames: ['Chien', 'Huang', 'Kao', 'Kung', 'Lao', 'Ling', 'Mei', 'Pin', 'Shin', 'Sum', 'Tan', 'Wan']
    },
    tethyrian: {
      maleGiven: ['Darvin', 'Dorn', 'Evendur', 'Gorstag', 'Grim', 'Helm', 'Malark', 'Morn', 'Randal', 'Stedd'],
      femaleGiven: ['Arveene', 'Esvele', 'Jhessail', 'Kerri', 'Lureene', 'Miri', 'Rowan', 'Shandri', 'Tessele'],
      surnames: ['Amblecrown', 'Buckman', 'Dundragon', 'Evenwood', 'Greycastle', 'Tallstag']
    },
    turami: {
      maleGiven: ['Anton', 'Diero', 'Marcon', 'Pieron', 'Rimardo', 'Romero', 'Salazar', 'Umbero'],
      femaleGiven: ['Balama', 'Dona', 'Faila', 'Jalana', 'Luisa', 'Marta', 'Quara', 'Selise', 'Vonda'],
      surnames: ['Agosto', 'Astorio', 'Calabra', 'Domine', 'Falone', 'Marivaldi', 'Pisacar', 'Ramondo']
    },
    /** Project-authored neutral default for unspecified/unknown human culture (distinct from Chondathan) */
    neutral: {
      maleGiven: ['Adrian', 'Julian', 'Gabriel', 'Marcus', 'Tristan', 'Valentin', 'Lucian', 'Dominic'],
      femaleGiven: ['Elena', 'Clara', 'Sylvia', 'Iris', 'Vivian', 'Marian', 'Celeste', 'Nora'],
      surnames: ['Vane', 'Sterling', 'Winter', 'Mercer', 'Fairfax', 'Cross', 'Holloway', 'Vance']
    }
  },

  // --- 9. Project-Authored Generic Extensions ---
  // Clearly separated from source data; used only as fallback for unknown non-source species/pools.
  projectExtensions: {
    genericFantasy: {
      unisexGiven: ['Valen', 'Kaelen', 'Rowan', 'Elden', 'Lyra', 'Soren'],
      surnames: ['Ashford', 'Riverbend', 'Ironwood', 'Stoneheart']
    }
  }
};
