import { MapMarker } from "../types";
import { toSlug } from "../lib/pathUtils";

export interface WikiImportResult {
  locationId: string;
  sublocations: Record<string, any[]>;
  metadata: any;
}

export const WIKI_CATEGORY_MAPPING: Record<string, string> = {
  // Common mappings based on Athkatla example
  "Districts": "districts",
  "Streets & Gates": "roads",
  "Gates": "gates",
  "Inns & Taverns": "inns_taverns",
  "Taverns & Eateries": "inns_taverns",
  "Inns & Lodging": "inns_taverns",
  "Temples & Shrines": "temples_shrines",
  "Shops & Warehouses": "shops",
  "Shops & Services": "shops",
  "Clubs": "poi",
  "Estates & Homes": "estates",
  "Residences & Estates": "estates",
  "Landmarks": "landmarks",
  "Points of Interest": "poi",
  "Bodies of Water": "water",
  "Government": "government",
  "Docks": "docks",
  "Wharves": "docks",
};

export class WikiImportService {
  /**
   * Fetches the map data from a Fandom ?action=mapedit URL
   * Note: Browser may block this due to CORS. 
   * In a real app we might need a server-side proxy.
   */
  async fetchMapData(url: string): Promise<any> {
    try {
      // Append format=json if not present
      const targetUrl = url.includes('action=mapedit') ? url : `${url}${url.includes('?') ? '&' : '?'}action=mapedit`;
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.isHtml) {
          throw new Error(`Fandom served a security check or HTML page instead of data. Please use "PASTE_MANUAL_JSON" mode instead.`);
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error("Fandom served an HTML page instead of JSON. Try manual paste.");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch from Wiki:", error);
      throw error;
    }
  }

  async fetchPageData(url: string): Promise<string> {
    try {
      // derive the API URL if it's a standard wiki URL
      let apiUrl = url;
      if (url.includes('/wiki/')) {
        const urlObj = new URL(url);
        const pageTitle = urlObj.pathname.split('/').pop();
        apiUrl = `${urlObj.origin}/api.php?action=parse&page=${pageTitle}&format=json&prop=text|sections&redirects=true`;
      }

      const proxyUrl = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.parse && data.parse.text) {
        return data.parse.text['*'];
      }
      return "";
    } catch (error) {
      console.error("Failed to fetch page content:", error);
      throw error;
    }
  }

  parseWikiSections(html: string): Record<string, string> {
    const sections: Record<string, string> = {};
    if (!html) return sections;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Clean up unwanted elements before processing
    const toRemove = doc.querySelectorAll('table.infobox, .navbox, .reference, .mw-editsection, .toc, script, style');
    toRemove.forEach(el => el.remove());

    const sectionHeadings = ['Description', 'Government', 'History', 'Organizations', 'Trade', 'Geography'];
    const headlines = doc.querySelectorAll('.mw-headline, h2, h3, h4, h5, h6');

    // First, find the lead section (content before any heading)
    let leadContent = "";
    let firstHeading = doc.querySelector('h1, h2, h3, h4, h5, h6');
    let leadCurrent: Element | null = doc.querySelector('p');
    if (leadCurrent) {
      while (leadCurrent && leadCurrent !== firstHeading) {
        if (leadCurrent.tagName === 'P') {
          leadContent += leadCurrent.textContent?.trim() + "\n\n";
        }
        leadCurrent = leadCurrent.nextElementSibling;
      }
    }
    if (leadContent.trim()) {
      sections.lead = leadContent.trim();
    }

    sectionHeadings.forEach(targetHeading => {
      let foundHeading: Element | null = null;
      
      for (const h of headlines) {
        const text = h.textContent?.trim().toLowerCase();
        if (text === targetHeading.toLowerCase() || (text && text.includes(targetHeading.toLowerCase()))) {
          foundHeading = h;
          break;
        }
      }

      if (foundHeading) {
        const headerElement = foundHeading.classList.contains('mw-headline') ? foundHeading.parentElement : foundHeading;
        if (!headerElement) return;

        const startLevel = parseInt(headerElement.tagName.substring(1));
        let content = "";
        let current = headerElement.nextElementSibling;
        
        while (current) {
          const tagName = current.tagName.toUpperCase();
          if (tagName.startsWith('H')) {
            const level = parseInt(tagName.substring(1));
            // Stop if we hit a heading of same or higher level
            if (level <= startLevel) break;
          }
          
          const text = current.textContent?.trim();
          if (text) {
            content += text + "\n\n";
          }
          current = current.nextElementSibling;
        }
        
        if (content.trim()) {
          sections[targetHeading.toLowerCase()] = content.trim();
        }
      }
    });

    // Fallback: if 'description' is missing and lead exists, lead is the description
    if (!sections.description && sections.lead) {
      sections.description = sections.lead;
    }

    return sections;
  }

  processWikiData(mapData: any, locationId: string): WikiImportResult {
    const markers = mapData.markers || [];
    const categories = mapData.categories || [];
    const coordOrder = mapData.coordinateOrder || "xy";
    
    // Create lookup for category names
    const categoryLookup: Record<string, string> = {};
    categories.forEach((cat: any) => {
      categoryLookup[cat.id] = cat.name;
    });

    const sublocations: Record<string, any[]> = {
      government: [],
      estates: [],
      inns_taverns: [],
      landmarks: [],
      poi: [],
      roads: [],
      shops: [],
      temples_shrines: [],
      water: [],
      gates: [],
      docks: []
    };

    markers.forEach((m: any, idx: number) => {
      const catName = categoryLookup[m.categoryId] || "Unknown";
      const targetCat = WIKI_CATEGORY_MAPPING[catName] || "poi";
      
      const marker = {
        id: m.id || `wiki-${idx}`,
        categoryId: targetCat,
        position: m.position, // Keep original [x, y] or [y, x], normalization happens in App.tsx
        popup: {
          title: m.popup?.title || "Unknown",
          description: m.popup?.description || "",
          link: m.popup?.link ? {
            url: m.popup.link.url,
            label: m.popup.link.label
          } : undefined,
          image: m.popup?.image
        }
      };

      if (sublocations[targetCat]) {
        sublocations[targetCat].push(marker);
      } else {
        sublocations.poi.push(marker);
      }
    });

    // Leave bounds as-is, normalization happens in App.tsx
    let mapBounds = mapData.mapBounds || [[0, 0], [1000, 1000]];

    return {
      locationId: toSlug(locationId),
      sublocations,
      metadata: {
        mapImage: mapData.mapImage,
        bounds: mapBounds,
        origin: mapData.origin || 'bottom-left',
        coordinateOrder: "yx" // Mark as normalized
      }
    };
  }
}
