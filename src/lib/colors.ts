
export const ALIGNMENT_COLORS: Record<string, string> = {
  "Lawful Good": "#2563EB", // Royal Blue
  "Neutral Good": "#10B981", // Emerald Green
  "Chaotic Good": "#22D3EE", // Bright Cyan
  "Lawful Neutral": "#475569", // Steel Blue
  "True Neutral": "#9CA3AF", // Medium Gray
  "Neutral": "#9CA3AF", // Neutral mapped to True Neutral
  "Chaotic Neutral": "#8B5CF6", // Violet
  "Lawful Evil": "#7F1D1D", // Dark Burgundy
  "Neutral Evil": "#991B1B", // Dark Red
  "Chaotic Evil": "#BE123C", // Deep Magenta
};

export const ALIGNMENT_SPRITE_POS: Record<string, string> = {
  "Lawful Good": "0% 0%",
  "Neutral Good": "50% 0%",
  "Chaotic Good": "100% 0%",
  "Lawful Neutral": "0% 50%",
  "True Neutral": "50% 50%",
  "Neutral": "50% 50%",
  "Chaotic Neutral": "100% 50%",
  "Lawful Evil": "0% 100%",
  "Neutral Evil": "50% 100%",
  "Chaotic Evil": "100% 100%",
};

export const normalizeAlignment = (alignment: string): string => {
  if (!alignment) return "True Neutral";
  // Replace underscores with spaces and capitalize each word
  let norm = alignment
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Handle "Natural" vs "Neutral" discrepancy
  norm = norm.replace(/Natural/g, 'Neutral');
  
  // Specific mappings for common misspellings or variants
  if (norm === "Neutral") return "True Neutral";
  if (norm === "True Natural") return "True Neutral";
  if (norm === "Chaotic Natural") return "Chaotic Neutral";
  
  return norm;
};

export const getAlignmentColor = (alignment: string): string => {
  const norm = normalizeAlignment(alignment);
  return ALIGNMENT_COLORS[norm] || "#4B5563"; // Default gray
};

export const getAlignmentBackgroundStyle = (alignment: string) => {
  const repo = "japiohopman/artificer";
  const branch = "main";
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/atlas/alignments/images/alignment_back.webp`;
  const norm = normalizeAlignment(alignment);
  const pos = ALIGNMENT_SPRITE_POS[norm] || ALIGNMENT_SPRITE_POS["True Neutral"];
  
  return {
    backgroundImage: `url(${url})`,
    backgroundPosition: pos,
    backgroundSize: "300% 300%",
    backgroundRepeat: "no-repeat"
  };
};

export const getAlignmentPortraitStyle = (alignment: string) => {
  const repo = "japiohopman/artificer";
  const branch = "main";
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/public/assets/atlas/alignments/images/aliment_bg.webp`;
  const norm = normalizeAlignment(alignment);
  const pos = ALIGNMENT_SPRITE_POS[norm] || ALIGNMENT_SPRITE_POS["True Neutral"];
  
  return {
    backgroundImage: `url(${url})`,
    backgroundPosition: pos,
    backgroundSize: "300% 300%",
    backgroundRepeat: "no-repeat"
  };
};
