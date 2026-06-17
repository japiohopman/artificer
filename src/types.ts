export type BookType = 'spellbook' | 'tome' | 'note' | 'magazine' | 'map' | 'ledger' | 'diary';

export interface Book {
  id: string;
  title: string;
  description?: string;
  author: string;
  type: BookType;
  language?: string;
  coverImage?: string;
  backCoverImage?: string;
  spineImage?: string;
  coverIndex: number;
  backCoverIndex?: number;
  spineIndex: number;
  pages?: any[];
}
