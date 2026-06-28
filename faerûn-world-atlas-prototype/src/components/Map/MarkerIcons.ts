import L from "leaflet";
import { GAME_ICONS, GameIconName } from "../../game_icons";

// Map category IDs to GameIcon keys from assets/icons/atlas.ts
const categoryToIcon: Record<string, GameIconName> = {
  "cities": "cities",
  "towns_settlements": "towns",
  "ruins": "ruins",
  "poi": "poi",
  "points_of_interest": "points_of_interest",
  "hills_mountains": "hills_mountains",
  "peaks_cliffs": "peaks",
  "forests": "forests",
  "water": "water",
  "wetlands": "wetlands",
  "islands": "islands",
  "deserts_wastelands": "deserts",
  "plains_grasslands": "plains",
  "glaciers_tundras": "glaciers",
  "oases": "oases",
  "roads_trails": "roads",
  "roads": "roads",
  "references": "compass",
  "shops": "shops",
  "inns_taverns": "inns_taverns",
  "taverns": "inns_taverns",
  "inns": "inns_taverns",
  "temples_shrines": "temples_shrines",
  "temples": "temples_shrines",
  "shrines": "temples_shrines",
  "districts": "cities",
  "landmarks": "landmarks",
  "government": "shield",
  "estate": "estates",
  "estates": "estates"
};

const categoryToColor: Record<string, string> = {
  "cities": "text-amber-500",
  "towns_settlements": "text-yellow-500",
  "ruins": "text-slate-400",
  "poi": "text-blue-600",
  "points_of_interest": "text-blue-600",
  "hills_mountains": "text-stone-500",
  "peaks_cliffs": "text-stone-400",
  "forests": "text-emerald-500",
  "water": "text-blue-400",
  "wetlands": "text-teal-500",
  "islands": "text-cyan-400",
  "deserts_wastelands": "text-amber-700",
  "plains_grasslands": "text-lime-500",
  "glaciers_tundras": "text-sky-200",
  "oases": "text-emerald-400",
  "roads_trails": "text-slate-600",
  "roads": "text-pink-600",
  "references": "text-indigo-400",
  "shops": "text-emerald-600",
  "inns_taverns": "text-orange-500",
  "taverns": "text-orange-500",
  "inns": "text-orange-500",
  "temples_shrines": "text-amber-400",
  "temples": "text-amber-400",
  "shrines": "text-amber-400",
  "districts": "text-slate-500",
  "landmarks": "text-rose-700",
  "government": "text-blue-500",
  "estate": "text-stone-400",
  "estates": "text-rose-400"
};

export function createCustomIcon(categoryId: string, isSelected: boolean) {
  const iconName = categoryToIcon[categoryId] || "poi";
  const colorClass = categoryToColor[categoryId] || "text-slate-400";
  const path = GAME_ICONS[iconName];

  // Clean implementation: Just the icon, no box/background, slightly larger
  // If selected, we override the color to blue-400 for consistency with the DevKit look
  const finalColor = isSelected ? 'text-blue-400' : colorClass;
  const shadow = isSelected 
    ? 'drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]' 
    : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]';

  return L.divIcon({
    html: `<div class="flex items-center justify-center w-10 h-10 transition-all duration-200 ${isSelected ? 'scale-125' : 'hover:scale-110'}">
             <svg viewBox="0 0 512 512" class="w-8 h-8 fill-current ${finalColor} ${shadow}">
               <path d="${path}" />
             </svg>
           </div>`,
    className: "marker-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}
