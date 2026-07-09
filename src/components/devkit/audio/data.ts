
import { Environment, Spell } from "../../../types/audio_kit";

export const ENVIRONMENTS: Environment[] = [
  {
    id: "nine-hells",
    name: "The Nine Hells",
    description: "Infernal heat, flickering flames, and the scent of brimstone.",
    color: "from-red-900 to-orange-700",
    imagePrompt: "A landscape of the nine hells, lava rivers, dark obsidian towers, infernal fire, D&D art style",
    hueSettings: {
      color: { xy: { x: 0.675, y: 0.322 } }, // Red
      dimming: { brightness: 100 }
    }
  },
  {
    id: "fay-forest",
    name: "Fay Forest",
    description: "Whispering leaves, bioluminescent fungi, and ancient magic.",
    color: "from-emerald-900 to-teal-600",
    imagePrompt: "A magical fey forest, glowing mushrooms, giant trees, ethereal light, D&D art style",
    hueSettings: {
      color: { xy: { x: 0.2, y: 0.7 } }, // Emerald Green
      dimming: { brightness: 60 }
    }
  },
  {
    id: "underdark",
    name: "The Underdark",
    description: "Deep silence, purple shadows, and unknown terrors.",
    color: "from-indigo-950 to-purple-900",
    imagePrompt: "The underdark cavern, giant luminescent crystals, dark purple atmosphere, subterranean world, D&D art style",
    hueSettings: {
      color: { xy: { x: 0.25, y: 0.1 } }, // Deep Purple
      dimming: { brightness: 30 }
    }
  },
  {
    id: "celestial",
    name: "Celestial Plane",
    description: "Radiant light, golden clouds, and divine peace.",
    color: "from-amber-100 to-yellow-500",
    imagePrompt: "A celestial plane, golden clouds, radiant light, floating marble platforms, divine atmosphere, D&D art style",
    hueSettings: {
      color: { xy: { x: 0.45, y: 0.45 } }, // Warm White
      dimming: { brightness: 100 }
    }
  }
];

export const SPELLS: Spell[] = [
  {
    id: "fireball",
    name: "Fireball",
    icon: "🔥",
    color: "bg-orange-500",
    hueSettings: {
      color: { xy: { x: 0.6, y: 0.35 } },
      dimming: { brightness: 100 }
    }
  },
  {
    id: "healing-word",
    name: "Healing Word",
    icon: "✨",
    color: "bg-blue-400",
    hueSettings: {
      color: { xy: { x: 0.2, y: 0.2 } },
      dimming: { brightness: 80 }
    }
  },
  {
    id: "magic-missile",
    name: "Magic Missile",
    icon: "☄️",
    color: "bg-indigo-500",
    hueSettings: {
      color: { xy: { x: 0.15, y: 0.1 } },
      dimming: { brightness: 100 }
    }
  },
  {
    id: "thunderwave",
    name: "Thunderwave",
    icon: "⚡",
    color: "bg-yellow-200",
    hueSettings: {
      color: { xy: { x: 0.3, y: 0.3 } },
      dimming: { brightness: 100 }
    }
  }
];
