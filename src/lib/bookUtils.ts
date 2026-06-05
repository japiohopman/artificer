import { useBookStore } from "../store/useBookStore";
import { Book } from "../types";

/**
 * Checks if an item has book-like properties.
 */
export function isBookLike(item: any): boolean {
  if (!item) return false;
  return item.equipment_category?.index === 'books' || 
         item.equipment_category === 'Books' || 
         item.type === 'spellbook' || 
         item.type === 'note' || 
         item.isBook || 
         item.type === 'map' || 
         item.type === 'tome' ||
         (typeof item.name === 'string' && (
           item.name.toLowerCase().includes('spellbook') || 
           item.name.toLowerCase().includes('journal') ||
           item.name.toLowerCase().includes('ledger')
         ));
}

/**
 * Validates if a generic object matches the Book schema loosely.
 */
function isValidBook(data: any): data is Book {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.id === 'string' &&
        typeof data.title === 'string' &&
        (Array.isArray(data.pages) || data.type === 'spellbook' || data.type === 'note' || data.type === 'map')
    );
}

/**
 * Extracts pages from an item object (equipment/spellbook).
 */
export function extractBookPages(item: any): any[] {
  if (!item) return [];

  // If the JSON explicitly defines pages
  if (item.pages && Array.isArray(item.pages)) {
    return item.pages.map((p: any, i: number) => ({
      id: `page-${i}`,
      title: p.title || `Chapter ${i + 1}`,
      content: p.content || p.desc || ""
    }));
  }

  // Special case for Spells if it's a spellbook
  if (item.type === 'spellbook' && item.spells && Array.isArray(item.spells)) {
     return item.spells.map((s: any, i: number) => ({
        id: `spell-${i}`,
        title: typeof s === 'string' ? s : s.name,
        content: `Arcane symbols and formula for ${typeof s === 'string' ? s : s.name}...`
     }));
  }

  // Fallback: one page with description
  const descriptionMarkdown = Array.isArray(item.desc) 
    ? item.desc.join('\n\n') 
    : (typeof item.desc === 'string' ? item.desc : "");

  return [{
    id: 'page-1',
    title: 'Transcription',
    content: descriptionMarkdown || "The pages are filled with ancient script..."
  }];
}

/**
 * Loads books from a remote JSON URL.
 */
export async function loadBooksFromJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch books: ${res.statusText}`);
    
    const data = await res.json();
    let booksToRegister: Book[] = [];

    if (Array.isArray(data)) {
        booksToRegister = data.filter(isValidBook);
    } else if (isValidBook(data)) {
        booksToRegister = [data];
    } else {
        console.error("Book JSON must be an array of book objects or a single book object.");
        return;
    }

    useBookStore.getState().registerBooks(booksToRegister);
    console.log(`Loaded ${booksToRegister.length} books from ${url}`);

  } catch (err) {
    console.error("Error loading books:", err);
  }
}

/**
 * Loads books directly from a static array (useful for testing or bundled content).
 */
export function loadBooksFromStaticJson(bookArray: any[]) {
  const validBooks = bookArray.filter(isValidBook);
  useBookStore.getState().registerBooks(validBooks);
  console.log(`Registered ${validBooks.length} static books.`);
}
