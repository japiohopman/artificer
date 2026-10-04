export type ExplorerDomain =
  | 'enemies'
  | 'materials'
  | 'equipment'
  | 'spells'
  | 'gods'
  | 'key'
  | 'books'
  | 'transport'
  | 'locations';

export interface ExplorerItem {
  id: string;
  index: string;
  name: string;
  domain: ExplorerDomain;
  category?: string;
  type?: string;
  description?: string;
  tags?: string[];
  rulesetContext?: '2014' | '2024';
  raw: any;
}

export interface SearchExplorerOptions {
  domainFilter?: ExplorerDomain | 'all';
  categoryFilter?: string | null;
  rulesetFilter?: '2014' | '2024';
}

export function scoreExplorerItem(item: ExplorerItem, query: string): number {
  if (!query) return 0;
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const id = (item.id || item.index || '').toLowerCase();
  const index = (item.index || item.id || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const category = (item.category || '').toLowerCase();
  const type = (item.type || '').toLowerCase();
  const description = (item.description || '').toLowerCase();

  let score = 0;

  // 1. Exact matches
  if (id === q || index === q) {
    score += 100;
  } else if (name === q) {
    score += 90;
  }

  // 2. Prefix matches
  if (id.startsWith(q) || index.startsWith(q)) {
    score += 80;
  }
  if (name.startsWith(q)) {
    score += 70;
  }

  // 3. Word boundary matches in name
  const nameWords = name.split(/[\s_\-]+/);
  if (nameWords.some(w => w.startsWith(q))) {
    score += 60;
  }

  // 4. Substring matches
  if (name.includes(q)) {
    score += 50;
  }
  if (id.includes(q) || index.includes(q)) {
    score += 40;
  }

  // 5. Category / type matches
  if (category.includes(q) || type.includes(q)) {
    score += 30;
  }

  // 6. Tags match
  if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q))) {
    score += 20;
  }

  // 7. Description match
  if (description.includes(q)) {
    score += 10;
  }

  return score;
}

export function searchExplorerItems(
  items: ExplorerItem[],
  query: string,
  options: SearchExplorerOptions = {}
): ExplorerItem[] {
  let filtered = items;

  // 1. Apply domain filter if specified
  if (options.domainFilter && options.domainFilter !== 'all') {
    filtered = filtered.filter(item => item.domain === options.domainFilter);
  }

  // 2. Apply category filter if specified
  if (options.categoryFilter) {
    filtered = filtered.filter(item => item.category === options.categoryFilter);
  }

  // 3. Apply ruleset filter if item has rulesetContext metadata
  if (options.rulesetFilter) {
    filtered = filtered.filter(item => {
      if (!item.rulesetContext) return true;
      return item.rulesetContext === options.rulesetFilter;
    });
  }

  const cleanQuery = query.trim();
  if (!cleanQuery) {
    // Return with stable default alphabetical ordering
    return [...filtered].sort((a, b) => {
      const nameCompare = (a.name || '').localeCompare(b.name || '');
      if (nameCompare !== 0) return nameCompare;
      return (a.index || '').localeCompare(b.index || '');
    });
  }

  // Score each item and filter out zero scores
  const scored = filtered
    .map(item => ({ item, score: scoreExplorerItem(item, cleanQuery) }))
    .filter(entry => entry.score > 0);

  // Sort deterministically: highest score first, then name, then index
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const nameCompare = (a.item.name || '').localeCompare(b.item.name || '');
    if (nameCompare !== 0) return nameCompare;
    return (a.item.index || '').localeCompare(b.item.index || '');
  });

  return scored.map(entry => entry.item);
}
